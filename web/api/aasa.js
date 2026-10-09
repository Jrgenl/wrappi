// Apple App Site Association for universal links (https://upmate.no/invite/<code>).
// Set APPLE_TEAM_ID (10 characters, from developer.apple.com > Membership) in Vercel.
const BUNDLE_ID = process.env.APPLE_BUNDLE_ID || 'no.upmate.app';

module.exports = (req, res) => {
  const teamId = process.env.APPLE_TEAM_ID || 'TEAMID_MISSING';
  const appID = `${teamId}.${BUNDLE_ID}`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(
    JSON.stringify({
      applinks: {
        details: [{ appIDs: [appID], components: [{ '/': '/invite/*', comment: 'Buddy invites' }] }],
      },
      webcredentials: { apps: [appID] },
    })
  );
};
