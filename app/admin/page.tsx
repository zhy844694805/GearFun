import { TrendingUp, ShoppingBag, DollarSign, Package } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    {
      name: '今日销售额',
      value: '¥12,345',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-600 bg-green-100',
    },
    {
      name: '今日订单',
      value: '45',
      change: '+8.2%',
      icon: ShoppingBag,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      name: '待发货订单',
      value: '12',
      change: '-5.1%',
      icon: Package,
      color: 'text-orange-600 bg-orange-100',
    },
    {
      name: '库存预警',
      value: '5',
      change: '+2',
      icon: TrendingUp,
      color: 'text-red-600 bg-red-100',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">仪表盘</h2>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <span className="text-sm text-gray-500">{stat.change}</span>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.name}</h3>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* 最近订单 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">最近订单</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  订单号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  客户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  时间
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    #202401010001
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    用户{i}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    ¥299.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      已付款
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2024-01-01 10:30
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
