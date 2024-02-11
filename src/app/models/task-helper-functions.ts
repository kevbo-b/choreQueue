export function convertDateToString(date: Date): string {
  var getYear = date.toLocaleString('default', { year: 'numeric' });
  var getMonth = date.toLocaleString('default', { month: '2-digit' });
  var getDay = date.toLocaleString('default', { day: '2-digit' });

  return getYear + '-' + getMonth + '-' + getDay;
}
