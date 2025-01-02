import sll from 'single-line-log2';

export default function progress(entry) {
  let message = `${entry.progress} ${entry.basename}`;
  if (entry.percentage) message += ` - ${entry.percentage.toFixed(0)}%`;
  sll.stdout(message);
}
