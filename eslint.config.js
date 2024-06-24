import { voxpelli } from '@voxpelli/eslint-config';

export default [
  ...voxpelli({
    noMocha: true,
  }),
  {
    files: ['test/**/*.js'],
    rules: {
      'n/no-unsupported-features/node-builtins': 0,
    },
  },
];
