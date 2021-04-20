const fs = require('fs');
const path = require('path');
const moment = require('moment');
const request = require('request-promise');
const _ = require('lodash');
const mkdirp = require('mkdirp');

/**
 * @callback queryCb
 * @param {Error | undefined}   error                 - query error, undefined if success
 * @param {Object | undefined} [response]             - query response object, undefined if error
 */
/**
 * Instantiates the object for interacting with Google QPX API
 * @class Api
 * @param {String} apikey                       - QPX api key
 * @param {Object} [options = {}]               - Optional parameters
 * @param {String} [options.backup = false]     - Absolute path for location to save full query response and request in JSON
 *                                                Backup filename = MM-DD-YY__origin__destination__current-date.json
 * @param {Boolean} [options.simple=true]       - If true, throws on invalid status codes
 * request in JSON
 */
function Api(apikey, options) {
  const defaultOptions = { backup: false, simple: true };
  this.options = _.defaultsDeep(options, defaultOptions);
  if (!apikey || typeof apikey !== 'string' || apikey.length === 0) {
    throw Error('Api class expects a valid apikey');
  }
  this.apikey = apikey;
  this.url = `https://www.googleapis.com/qpxExpress/v1/trips/search?key=${this.apikey}`;
}

// instance methods
/**
 * Perform a Google QPX query
 * @see https://developers.google.com/qpx-express/v1/trips/search#request
 * @memberOf Api
 * @param {Object} q                          - Query object
 * @param {String} q.maxPrice                 - The max price for the trip. Note - Must be prefixed with currency i.e. EUR.
 * @param {String} q.origin                   - The origin airport code.
 * @param {String} q.destination              - The destination airport code.
 * @param {String|Number} q.date              - The date of the flight... moment will attempt to parse the date to YYYY-MM-DD
 *                                                e.g. '2016-12-14' or ms timestamp will work
 * @param {Number} [q.solutions=500]          - The number of possible routes the API should return.
 * @param {Number} [q.adultCount=1]           - The number of adults going on the trip.
 * @param {Number} [q.childCount=0]           - The number of children going on the trip.
 * @param {Number} [q.infantInLapCount=0]     - The number of passengers that are infants travelling in the lap of an adult.
 * @param {Number} [q.infantInSeatCount=0]    - The number of passengers that are infants each assigned a seat.
 * @param {Number} [q.seniorCount=0]          - The number of passengers that are senior citizens.
 * @param {Number} [q.maxStops=∞]             - The maximum number of stops the passenger(s)
 *                                                are willing to accept in this slice.
 * @param {Number} [q.maxConnectionDuration=∞]- The longest connection between two legs, in minutes.
 * @param {String} [q.earliestTime=00:00]     - The earliest time of day in HH:MM format for departure.
 * @param {String} [q.latestTime=23:59]       - The latest time of day in HH:MM format for departure.
 * @param {String} [q.refundable=Either]      - Return only solutions with refundable fares.
 * @param {String} [q.preferredCabin=Any]     - Allowed values are COACH, PREMIUM_COACH, BUSINESS, and FIRST.
 * @param {Array}  [q.permittedCarrier=Any]   - A list of 2-letter IATA airline designators to filter your results.
 * @param {Array}  [q.prohibitedCarrier=None] - A list of 2-letter IATA airline designators. Exclude results that match.
 * @param {String} [q.alliance=Any]           - Slices with only the carriers in this alliance should be returned;
 *                                                do not use this field with permittedCarrier.
 *                                                Allowed values are ONEWORLD, SKYTEAM, and STAR.
 * @param {String} [q.saleCountry]            - IATA country code representing the point of sale.
 *                                                This determines the "equivalent amount paid" currency for the ticket.
 * @param {String} [q.ticketingCountry]       - IATA country code representing the point of ticketing.
 * @param {queryCb} [cb]                      - If you want to use callbacks instead of promises
 * @returns {Promise | undefined}             - Resolves to response object or undefined if using callback
 *                                                @see https://developers.google.com/qpx-express/v1/trips/search#response
 */
Api.prototype.query = async function query(q, cb) {
  try {
    // When using callback instead of promise
    if (cb) {
      return cb(null, await this.query(q));
    }

    const defaultQ = {
      adultCount: 1,
      solutions: 500,
    };

    const queryBody = Api._getQueryBody(_.defaultsDeep(q, defaultQ));
    const queryRequest = { method: 'POST', url: this.url, body: queryBody, json: true, simple: this.options.simple };
    const queryResponse = await Api._queryPromise(queryRequest);

    if (this.options.backup) {
      Api._saveQueryData(this.options.backup, q, queryRequest, queryResponse);
    }

    if (_.isError(queryResponse)) {
      throw queryResponse;
    }
    return queryResponse;
  } catch (e) {
    if (cb) {
      return cb(e);
    }

    throw e;
  }
};

/**
 * Perform a Google QPX query, no processing will be done on the query or response so it must follow the api format
 * @see https://developers.google.com/qpx-express/v1/trips/search#request
 * @see https://developers.google.com/qpx-express/v1/trips/search#response
 * @memberOf Api
 * @param    {Object}   q                      - Query object
 * @param    {queryCb} [cb]                    - If you want to use callbacks instead of promises
 * @returns  {Promise | undefined}             - Resolves to response object or undefined if using callback
 */
Api.prototype.rawQuery = async function query(q, cb) {
  // When using callback instead of promise
  if (cb) {
    try {
      return cb(null, await this.query(q));
    } catch (e) {
      return cb(e);
    }
  }

  const queryRequest = { method: 'POST', url: this.url, body: q, json: true, simple: this.options.simple };
  const queryResponse = await Api._queryPromise(queryRequest);

  if (this.options.backup) {
    Api._saveQueryData(this.options.backup, q, queryRequest, queryResponse);
  }

  return queryResponse;
};


// static methods
/**
 * Save request and response data to json file for backup purposes
 * @param {String} savePath     - Path to save file
 * @param {Object} q            - Original query argument
 * @param {Object} req          - Query request
 * @param {Object} res          - Query response
 * @static
 * @memberOf Api
 * @private
 */
Api._saveQueryData = function (savePath, q, req, res) {
  // Create sub directories if they don't exist
  mkdirp.sync(savePath);
  // Save backup req and response as timestamp.json
  const qDate = moment(q.date).format('MM-DD-YY');
  const currDate = moment().format('MM-DD-YY_h:mm:ssa');
  const f = `${qDate}__${q.origin}__${q.destination}__${currDate}.json`;
  const writePath = path.resolve(savePath, f);
  fs.writeFileSync(writePath, JSON.stringify({ query: q, request: req, response: res }, null, 2), 'utf8');
};

/**
 * Returns a promise which resolves to the response body
 * @param {Object} queryRequest          - The request object made to the QPX api
 * @returns {Promise} Promise with query response body
 * @throws Will throw an error if request-promise fails
 * @static
 * @memberOf Api
 * @private
 */
Api._queryPromise = async function (queryRequest) {
  try {
    const response = await request(queryRequest);
    return response;
  } catch (e) {
    return e;
  }
};

/**
 * Constructs the body for the QPX query
 * Refer to Api.query for details about params
 * @see Api.query
 * @param {Object} q
 * @param {String} q.origin
 * @param {String} q.destination
 * @param {String} q.date
 * @param {String} q.maxPrice
 * @param {Number} q.solutions
 * @param {Number} [q.adultCount]
 * @param {Number} [q.childCount]
 * @param {Number} [q.infantInLapCount]
 * @param {Number} [q.infantInSeatCount]
 * @param {Number} [q.seniorCount]
 * @param {Number} [q.maxStops]
 * @param {Number} [q.maxConnectionDuration]
 * @param {String} [q.preferredCabin]
 * @param {String} [q.earliestTime]
 * @param {String} [q.latestTime]
 * @param {Array}  [q.permittedCarrier]
 * @param {Array}  [q.prohibitedCarrier]
 * @param {String} [q.alliance]
 * @param {String} [q.saleCountry]
 * @static
 * @memberOf Api
 * @private
 */
Api._getQueryBody = function ({
                                adultCount,
                                childCount,
                                infantInLapCount,
                                infantInSeatCount,
                                seniorCount,
                                origin,
                                destination,
                                date,
                                maxStops,
                                maxConnectionDuration,
                                preferredCabin,
                                permittedCarrier,
                                prohibitedCarrier,
                                alliance,
                                earliestTime,
                                latestTime,
                                maxPrice,
                                solutions,
                                saleCountry,
                              }) {
  date = moment(date).format('YYYY-MM-DD');
  return {
    request: {
      passengers: {
        kind: 'qpxexpress#passengerCounts',
        adultCount,
        childCount,
        infantInLapCount,
        infantInSeatCount,
        seniorCount,
      },
      maxPrice,
      solutions,
      slice: [{
        kind: 'qpxexpress#sliceInput',
        origin,
        destination,
        date,
        maxStops,
        preferredCabin,
        maxConnectionDuration,
        permittedCarrier,
        prohibitedCarrier,
        alliance,
        permittedDepartureTime: {
          kind: 'qpxexpress#timeOfDayRange',
          earliestTime,
          latestTime,
        },
      }],
      saleCountry,
    },
  };
};

module.exports = Api;
