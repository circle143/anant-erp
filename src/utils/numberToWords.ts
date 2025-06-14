export const numberToWords=(num: number): string => {
  const a = [
    '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
    'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
    'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
  ];
  const b = [
    '', '', 'twenty', 'thirty', 'forty', 'fifty',
    'sixty', 'seventy', 'eighty', 'ninety',
  ];

  const numberToWordsHelper = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + numberToWordsHelper(n % 100) : '')
      );
    if (n < 100000)
      return (
        numberToWordsHelper(Math.floor(n / 1000)) +
        ' thousand' +
        (n % 1000 ? ' ' + numberToWordsHelper(n % 1000) : '')
      );
    if (n < 10000000)
      return (
        numberToWordsHelper(Math.floor(n / 100000)) +
        ' lakh' +
        (n % 100000 ? ' ' + numberToWordsHelper(n % 100000) : '')
      );
    return (
      numberToWordsHelper(Math.floor(n / 10000000)) +
      ' crore' +
      (n % 10000000 ? ' ' + numberToWordsHelper(n % 10000000) : '')
    );
  };

  return numberToWordsHelper(num);
}
