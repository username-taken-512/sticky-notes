// Google Analytics reporting API
const { google } = require('googleapis');
const scopes = ['https://www.googleapis.com/auth/analytics.readonly'];

const viewId = process.env.GA_VIEW_ID;

// JWT for auth towards GA Reporting API
let gaJwt = new google.auth.JWT(
  process.env.GA_CLIENT_EMAIL,
  null,
  process.env.GA_PRIVATE_KEY.replace(/\\n/gm, '\n'),
  scopes
);

async function getVisitorData30Days() {
  const response = await gaJwt.authorize();
  const result = await google.analytics('v3').data.ga.get({
    'auth': gaJwt,
    'ids': 'ga:' + viewId,
    'start-date': '30daysAgo',
    'end-date': 'today',
    'metrics': 'ga:sessions',
    'dimensions': 'ga:deviceCategory,ga:operatingSystem,ga:browser,ga:browserVersion,ga:region,ga:language'
  });

  // console.dir(result);
  //console.log(result.data.rows);
  return result.data.rows;
}

module.exports = {
  getVisitorData30Days: getVisitorData30Days
};