// babel-tap.js
module.exports = function tapPlugin() {
  return {
    name: 'tap-plugin',
    pre(_, { plugins }) {
      console.log(
        '\n🔎  Final plugin order Babel received:\n',
        plugins.map((p) => (typeof p === 'string' ? p : p?.key || p?.name))
      );
    },
  };
};
