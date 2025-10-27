import { Search, Eye, Package } from 'lucide-react';

export default function OrdersPage() {
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-blue-100 text-blue-800',
    SHIPPING: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  };

  const statusNames: Record<string, string> = {
    PENDING: '待付款',
    PAID: '已付款',
    SHIPPING: '已发货',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">订单管理</h2>

      {/* 订单状态统计 */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: '全部订单', count: 156 },
          { label: '待付款', count: 12 },
          { label: '待发货', count: 28 },
          { label: '已发货', count: 45 },
          { label: '已完成', count: 71 },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-lg shadow p-4 text-center cursor-pointer hover:shadow-md transition">
            <p className="text-2xl font-bold text-primary-600 mb-1">{item.count}</p>
            <p className="text-sm text-gray-600">{item.label}</p>
          </div>
        ))}
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜索订单号、客户姓名..."
              className="input-field pl-10"
            />
          </div>
          <select className="input-field w-40">
            <option value="">全部状态</option>
            <option value="PENDING">待付款</option>
            <option value="PAID">已付款</option>
            <option value="SHIPPING">已发货</option>
            <option value="COMPLETED">已完成</option>
          </select>
          <input type="date" className="input-field w-40" />
        </div>
      </div>

      {/* 订单列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                订单号
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                客户信息
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                商品数量
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                订单金额
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                下单时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { status: 'PENDING' },
              { status: 'PAID' },
              { status: 'SHIPPING' },
              { status: 'COMPLETED' },
              { status: 'PAID' },
            ].map((order, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  #20240101000{i + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div>
                    <p className="font-medium">张三{i + 1}</p>
                    <p className="text-gray-500 text-xs">138****{1000 + i}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {Math.floor(Math.random() * 3) + 1} 件
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                  €{(Math.random() * 500 + 100).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${statusColors[order.status]}`}>
                    {statusNames[order.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2024-01-0{i + 1} 10:30
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded" title="查看详情">
                      <Eye size={16} />
                    </button>
                    {order.status === 'PAID' && (
                      <button className="p-1 hover:bg-gray-100 rounded text-blue-600" title="发货">
                        <Package size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-gray-600">共 156 个订单</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded hover:bg-gray-50">上一页</button>
          <button className="px-3 py-1 bg-primary-600 text-white rounded">1</button>
          <button className="px-3 py-1 border rounded hover:bg-gray-50">2</button>
          <button className="px-3 py-1 border rounded hover:bg-gray-50">3</button>
          <button className="px-3 py-1 border rounded hover:bg-gray-50">下一页</button>
        </div>
      </div>
    </div>
  );
}
