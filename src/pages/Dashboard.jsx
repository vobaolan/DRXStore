import React, { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { 
  CircleDollarSign, 
  CornerUpLeft, 
  ArrowDown, 
  ArrowUp,
  ShoppingBag,
  PackageCheck,
  ChevronDown
} from 'lucide-react';

const Dashboard = () => {
  const { orders, customers, products, activeUser } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('Theo ngày');
  const [chartTime, setChartTime] = useState('all');
  const [topProductsMetric, setTopProductsMetric] = useState('revenue');
  const [topProductsTime, setTopProductsTime] = useState('all');
  const [topCustomersTime, setTopCustomersTime] = useState('all');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price);
  };
  const calculateTotalRevenue = (orderList) => {
    return orderList.reduce((sum, o) => sum + (o.total - o.discount), 0);
  };

  const calculateProfit = (orderList) => {
    return orderList.reduce((sum, o) => {
      const orderRevenue = o.total - o.discount;
      let orderCost = 0;
      o.items.forEach(item => {
        const product = products.find(p => p.sku === item.sku);
        const costPrice = product ? Number(product.costPrice) || 0 : 0;
        orderCost += costPrice * item.qty;
      });
      return sum + (orderRevenue - orderCost);
    }, 0);
  };

  const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const todaysOrders = orders.filter(o => o.date.startsWith(today));
  const todaysGrossRevenue = calculateTotalRevenue(todaysOrders);
  const todaysProfit = calculateProfit(todaysOrders);
  const todaysCount = todaysOrders.length;
  
  const calculateDisplayValue = activeUser?.department === 'Admin' ? calculateProfit : calculateTotalRevenue;
  const totalRevenue = calculateDisplayValue(orders);

  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  });

  const chartData = last7Days.map(dateStr => {
    const dayOrders = orders.filter(o => o.date.startsWith(dateStr));
    const dayTotal = calculateDisplayValue(dayOrders);
    return {
      label: dateStr.substring(0, 5),
      value: dayTotal / 1000000,
      labelY: `${(dayTotal / 1000000).toFixed(1)} tr`
    };
  });
  const maxChartValue = Math.max(...chartData.map(d => d.value), 10);

  // --- CHART TIME FILTER ---
  let totalRevenueDisplay = 0;
  if (chartTime === 'all') totalRevenueDisplay = calculateDisplayValue(orders);
  if (chartTime === 'month') {
    const monthYear = today.substring(3);
    totalRevenueDisplay = calculateDisplayValue(orders.filter(o => o.date.substring(3, 10) === monthYear));
  }
  if (chartTime === 'today') {
    totalRevenueDisplay = calculateDisplayValue(orders.filter(o => o.date.startsWith(today)));
  }

  // --- RECENT ACTIVITIES ---
  const recentActivities = orders.slice(0, 10).map(o => ({
    id: o.id,
    user: o.staffName || 'Admin',
    action: 'bán đơn hàng',
    amount: formatPrice(o.total - o.discount) + ' ₫',
    time: o.date,
    type: 'sell'
  }));

  // --- TOP CUSTOMERS ---
  const filteredCustOrders = orders.filter(o => {
    if (topCustomersTime === 'today') return o.date.startsWith(today);
    if (topCustomersTime === 'month') return o.date.substring(3, 10) === today.substring(3);
    return true;
  });
  
  const custStats = {};
  filteredCustOrders.forEach(o => {
    const val = calculateDisplayValue([o]);
    if (!custStats[o.customerCode]) custStats[o.customerCode] = { name: o.customer, val: 0 };
    custStats[o.customerCode].val += val;
  });
  
  const rawCusts = Object.values(custStats).sort((a, b) => b.val - a.val).slice(0, 10);
  const maxCustValue = Math.max(...rawCusts.map(c => c.val), 1000000) / 1000000;
  const topCustomers = rawCusts.map(c => ({
    name: c.name,
    value: (c.val / 1000000).toFixed(1),
    max: maxCustValue
  }));

  // --- TOP PRODUCTS ---
  const filteredProdOrders = orders.filter(o => {
    if (topProductsTime === 'today') return o.date.startsWith(today);
    if (topProductsTime === 'month') return o.date.substring(3, 10) === today.substring(3);
    return true;
  });
  const productStats = {};
  filteredProdOrders.forEach(o => {
    o.items.forEach(item => {
      if (!productStats[item.name]) productStats[item.name] = { qty: 0, revenue: 0 };
      productStats[item.name].qty += item.qty;
      const product = products.find(p => p.sku === item.sku);
      const costPrice = product ? Number(product.costPrice) || 0 : 0;
      const valPerItem = activeUser?.department === 'Admin' ? (item.finalPrice - costPrice) : item.finalPrice;
      productStats[item.name].revenue += valPerItem * item.qty;
    });
  });
  const topProductsRaw = Object.keys(productStats)
    .map(name => ({ 
      name, 
      value: topProductsMetric === 'qty' ? productStats[name].qty : productStats[name].revenue 
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
  const maxProductValue = Math.max(...topProductsRaw.map(p => p.value), 10);
  const topProducts = topProductsRaw.map(p => ({ 
    ...p, 
    max: maxProductValue,
    displayValue: topProductsMetric === 'qty' ? `${p.value} chiếc` : `${(p.value / 1000000).toFixed(1)} tr`
  }));

  return (
    <div className="space-y-6">
      {/* 1. TOP CARDS */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">Kết quả bán hàng hôm nay</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-700">
          {/* Card 1: Doanh thu (Lợi nhuận) */}
          <div className="p-6 flex items-start gap-4">
            <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-[#E5F1FF] dark:bg-[#0052FF]/20 text-[#0052FF] dark:text-[#6699ff] flex items-center justify-center">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {activeUser?.department === 'Admin' ? 'Doanh thu' : 'Tổng tiền hôm nay đã thu được'}
              </p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                {formatPrice(activeUser?.department === 'Admin' ? todaysProfit : todaysGrossRevenue)}
              </h3>
            </div>
          </div>

          {/* Card 2: Đơn hàng */}
          <div className="p-6 flex items-start gap-4">
            <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Đơn hàng hôm nay</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{todaysCount}</h3>
            </div>
          </div>

          {/* Card 3: Sản phẩm đã bán */}
          <div className="p-6 flex items-start gap-4">
            <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Sản phẩm bán ra</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                {todaysOrders.reduce((sum, o) => sum + o.items.reduce((s, item) => s + item.qty, 0), 0)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE SECTION: CHART & ACTIVITIES */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Main Chart */}
        <div className="xl:col-span-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col transition-colors">
          {/* Chart Header */}
          <div className="p-6 pb-2 border-b border-slate-100 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-baseline gap-3">
              <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">
                {activeUser?.department === 'Admin' ? 'Doanh thu tổng' : 'Tổng tiền thu được'}
              </h2>
              <span className="text-xl font-bold text-[#0052FF] dark:text-[#6699ff]">{formatPrice(totalRevenueDisplay)}</span>
            </div>
            
            <div className="relative">
              <select 
                value={chartTime}
                onChange={(e) => setChartTime(e.target.value)}
                className="appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer focus:outline-none focus:border-[#0052ff]"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="month">Tháng này</option>
                <option value="today">Hôm nay</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Chart Tabs */}
          <div className="px-6 flex gap-6 border-b border-slate-100 dark:border-slate-700">
            {['Theo ngày', 'Theo giờ', 'Theo thứ'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-[13px] font-semibold border-b-2 transition-colors ${
                  activeTab === tab 
                    ? 'border-[#0052FF] text-[#0052FF] dark:text-[#6699ff]' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* CSS Bar Chart */}
          <div className="p-6 flex-1 flex flex-col min-h-[300px]">
            <div className="relative flex-1 flex">
              {/* Y-Axis Guidelines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                {[30, 27, 24, 21, 18, 15, 12, 9, 6, 3, 0].map((val, idx) => (
                  <div key={idx} className="flex items-center w-full">
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 w-8 flex-shrink-0 text-right pr-2">
                      {val === 0 ? '0' : `${val} tr`}
                    </span>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700/50"></div>
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div className="relative z-10 flex-1 flex items-end justify-around pl-8 pt-4 pb-[1px]">
                {chartData.map((data, index) => {
                  const heightPercent = (data.value / maxChartValue) * 100;
                  return (
                    <div key={index} className="flex flex-col items-center justify-end h-full group relative w-full px-1 sm:px-2">
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 dark:bg-slate-600 text-white text-[10px] font-bold py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-20 shadow-lg">
                        {data.labelY}
                      </div>
                      
                      {/* Bar */}
                      <div 
                        className="w-full max-w-[24px] bg-[#0052FF] dark:bg-[#4d88ff] rounded-t-[2px] group-hover:bg-[#003bb8] dark:group-hover:bg-[#80aaff] transition-colors"
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-around pl-8 pt-2">
              {chartData.map((data, index) => (
                <div key={index} className="w-full px-1 sm:px-2 text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  {data.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities Sidebar */}
        <div className="xl:col-span-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-[500px] xl:h-auto overflow-hidden transition-colors">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/20">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Có <span className="text-emerald-600 dark:text-emerald-400 font-bold">{recentActivities.length} hoạt động bán hàng</span> gần đây.
            </p>
            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 cursor-pointer" />
          </div>
          
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Hoạt động gần đây</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-default">
                <div className="mt-0.5 flex-shrink-0 text-slate-400 dark:text-slate-500">
                  {act.type === 'sell' ? (
                    <ShoppingBag className="w-4 h-4" />
                  ) : (
                    <PackageCheck className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-snug">
                    <span className="font-bold text-[#0052FF] dark:text-[#6699ff] cursor-pointer hover:underline">{act.user}</span>{' '}
                    vừa <span className="font-bold text-[#0052FF] dark:text-[#6699ff] cursor-pointer hover:underline">{act.action}</span>{' '}
                    với giá trị <span className="font-bold text-slate-800 dark:text-white">{act.amount}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: TOP 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 10 Hàng bán chạy */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-slate-800 dark:text-white">Top 10 hàng bán chạy</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select 
                  value={topProductsMetric}
                  onChange={(e) => setTopProductsMetric(e.target.value)}
                  className="appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded pl-2.5 pr-6 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer focus:outline-none focus:border-[#0052ff]"
                >
                  <option value="revenue">Theo lợi nhuận</option>
                  <option value="qty">Theo số lượng</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative">
                <select 
                  value={topProductsTime}
                  onChange={(e) => setTopProductsTime(e.target.value)}
                  className="appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded pl-2.5 pr-6 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer focus:outline-none focus:border-[#0052ff]"
                >
                  <option value="all">Tất cả</option>
                  <option value="month">Tháng này</option>
                  <option value="today">Hôm nay</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="p-6 space-y-5">
            {topProducts.map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-200">{item.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">{item.displayValue}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#0052FF] dark:bg-[#4d88ff] h-full rounded-full"
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 10 Khách mua nhiều nhất */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-slate-800 dark:text-white">Top 10 khách mua nhiều nhất</h3>
            <div className="relative">
              <select 
                value={topCustomersTime}
                onChange={(e) => setTopCustomersTime(e.target.value)}
                className="appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded pl-2.5 pr-6 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer focus:outline-none focus:border-[#0052ff]"
              >
                <option value="all">Tất cả</option>
                <option value="month">Tháng này</option>
                <option value="today">Hôm nay</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div className="p-6 space-y-6">
            {topCustomers.map((cus, i) => (
              <div key={i} className="space-y-1.5 relative">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">{cus.name}</span>
                <div className="flex items-center">
                  <div 
                    className="bg-[#0052FF] dark:bg-[#4d88ff] h-5"
                    style={{ width: `${(cus.value / cus.max) * 100}%` }}
                  ></div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-2">{cus.value} tr</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
