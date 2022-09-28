/*
 * @Author: jinxu@tuzhanai.com
 * @Date: 2022-09-09 19:07:59
 * @LastEditors: jinxu@tuzhanai.com
 * @LastEditTime: 2022-09-28 16:15:31
 * @FilePath: /jubilant-broccoli/.eslintrc.js
 * @Description:
 * Copyright (c) 2022 by jinxu@tuzhanai.com, All Rights Reserved.
 */
const { getESLintConfig } = require('@iceworks/spec');

module.exports = getESLintConfig('common-ts', {
  rules: {
    '@typescript-eslint/no-require-imports': 'off',
    indent: 'off',
    '@typescript-eslint/indent': 'warn',
    'no-await-in-loop': 'off',
  },
});
