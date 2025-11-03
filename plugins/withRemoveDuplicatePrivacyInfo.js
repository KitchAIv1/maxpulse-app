const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Remove duplicate PrivacyInfo.xcprivacy from IQKeyboardManagerSwift pod
 * to prevent "Multiple commands produce" Xcode build error
 */
const withRemoveDuplicatePrivacyInfo = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podPath = path.join(
        config.modRequest.platformProjectRoot,
        'Pods',
        'IQKeyboardManagerSwift',
        'IQKeyboardManagerSwift',
        'PrivacyInfo.xcprivacy'
      );

      // Remove duplicate privacy file if it exists
      if (fs.existsSync(podPath)) {
        console.log('🔧 Removing duplicate PrivacyInfo.xcprivacy from IQKeyboardManagerSwift');
        fs.unlinkSync(podPath);
        console.log('✅ Duplicate PrivacyInfo.xcprivacy removed');
      } else {
        console.log('ℹ️ No duplicate PrivacyInfo.xcprivacy found');
      }

      return config;
    },
  ]);
};

module.exports = withRemoveDuplicatePrivacyInfo;

