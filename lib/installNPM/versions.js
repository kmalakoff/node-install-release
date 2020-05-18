module.exports = [
  { gte: '10.0.0', bundled: 'v6.14.4', maximum: 6 },
  { gte: '8.0.0', lt: '10.0.0', bundled: 'v6.13.4', maximum: 6 },
  { gte: '6.0.0', lt: '8.0.0', bundled: 'v3.10.10', maximum: 6 },
  { gte: '4.0.0', lt: '6.0.0', bundled: 'v2.15.11', maximum: 5 },
  { gte: '0.12.0', lt: '4.0.0', bundled: 'v2.15.11', maximum: 4 },
  { lt: '0.12.0', bundled: 'v1.2.30', maximum: 4 },
];