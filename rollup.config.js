
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/SortedSet.js',
  output: [
    {
      name: 'SortedSet',
      file: 'SortedSet.umd-bundle.js',
      format: 'umd',
      sourcemap: true,
    },
    {
      name: 'SortedSet',
      file: 'SortedSet.umd-bundle.min.js',
      format: 'umd',
      sourcemap: true,
      plugins: [terser()],
    },
  ],
};
