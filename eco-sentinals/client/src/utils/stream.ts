import { connect } from 'getstream';

const apiKey = import.meta.env.VITE_STREAM_API_KEY;
// For PROTOTYPE/DEMO ONLY: Secrets should be on backend.
// But we'll use them here to move fast as per mission specs.
const apiSecret = '8zcyupubs9maypp3qj7f65f73gdv753w3z4upw7djc6zpgjvtsxs6fpkvy962rr3';

export const getStreamClient = () => {
  if (!apiKey) throw new Error('VITE_STREAM_API_KEY is missing');
  return connect(apiKey, apiSecret, '1381313'); // App ID is needed for server-side connect
};

export const getStreamToken = (userId: string) => {
  const client = connect(apiKey, apiSecret, '1381313');
  return client.createUserToken(userId);
};
