async function testAll() {
  const routes = [
    '/',
    '/track-order',
    '/admin/login',
    '/admin',
    '/admin/orders',
    '/admin/menu',
    '/admin/menu-planner',
    '/admin/items',
    '/admin/food-items',
    '/admin/customers',
    '/admin/analytics',
    '/admin/promotions',
    '/admin/reviews',
    '/admin/settings',
    '/admin/audit',
    '/admin/audit-log',
    '/api/settings',
    '/api/food-items',
    '/api/orders',
    '/api/auth/session'
  ];

  let okCount = 0;
  for (const r of routes) {
    try {
      const res = await fetch('http://localhost:3000' + r);
      console.log(`[${res.status}] ${r}`);
      if (res.status === 200) okCount++;
    } catch (e) {
      console.error(`[FAIL] ${r}: ${e.message}`);
    }
  }
  console.log(`\nResult: ${okCount}/${routes.length} routes returned HTTP 200`);
}
testAll();
