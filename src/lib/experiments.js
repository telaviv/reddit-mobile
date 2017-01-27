function extractUser(state) {
  if (!state.user || !state.accounts) {
    return;
  }
  return state.accounts[state.user.name];
}

export function getExperimentData(state, experimentName) {
  const user = extractUser(state);
  if (!(user && user.features && user.features[experimentName])) {
    return;
  }
  return user.features[experimentName];
}
