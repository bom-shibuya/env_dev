module.exports = (path) => {
  const basePath = path || '';
  return {
    SRC: basePath + 'app/src/',
    SRC_ASSETS: basePath + 'app/src/assets/',
    DEST: basePath + 'app/dest/',
    DEST_ASSETS: basePath + 'app/dest/assets/',
    RELEASE: basePath + 'app/_release/',
    RELEASE_ASSETS: basePath + 'app/_release/assets/',
  };
};
