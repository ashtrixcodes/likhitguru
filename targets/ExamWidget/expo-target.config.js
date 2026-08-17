/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: "widget",
  icon: "../../assets/images/icon.png",
  entitlements: {
    "com.apple.security.application-groups": ["group.com.likhitguru.app"],
  },
};
