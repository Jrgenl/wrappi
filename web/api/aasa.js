// Apple App Site Association for universal links (https://upmate.no/invite/<code>).
// Team ID belongs to Brumio AS; APPLE_TEAM_ID can override it.
const BUNDLE_ID = process.env.APPLE_BUNDLE_ID || 'no.upmate.app';

module.exports = (req, res) => {
  const teamId = process.env.APPLE_TEAM_ID || 'H43G8Z9H7V';
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
