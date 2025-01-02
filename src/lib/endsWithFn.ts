import endsWith from 'end-with';
import isArray from 'isarray';

export default function endsWithFn(endings) {
  if (!isArray(endings)) endings = [endings];
  return (string) => {
    for (let index = 0; index < endings.length; index++) {
      if (endsWith(string, endings[index])) return true;
    }
    return false;
  };
}
