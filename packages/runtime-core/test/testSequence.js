const arr = [2, 3, 1, 5, 6, 8, 7, 9, 4];

function getSequence(arr) {
  const len = arr.length;
  const result = [0];
  const p = arr.slice(0);
  let start;
  let end;
  let middle;

  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      let resultLastIndex = result[result.length - 1];

      if (arr[resultLastIndex] < arrI) {
        p[i] = resultLastIndex;
        result.push(i);
        continue;
      }

      start = 0;
      end = result.length - 1;
      while (start < end) {
        middle = ((start + end) / 2) | 0;
        if (arr[result[middle]] < arrI) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }

      if (arrI < arr[result[start]]) {
        if (start > 0) {
          p[i] = result[start - 1];
        }
        result[start] = i;
      }
    }
  }

  let len1 = result.length;
  let last = result[len1 - 1];
  while (len1-- > 0) {
    result[len1] = last;
    last = p[last];
  }

  return result;
}

console.log(getSequence(arr));
