import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  // 创建分类
  const categories = [
    { id: 'cat1', name: '汽车用品', slug: 'car-accessories', icon: '🚗' },
    { id: 'cat2', name: '电脑配件', slug: 'computer-parts', icon: '💻' },
    { id: 'cat3', name: '手办周边', slug: 'figures', icon: '🎮' },
    { id: 'cat4', name: '挂饰装饰', slug: 'decorations', icon: '✨' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    });
  }

  console.log('分类创建完成！');

  // 创建示例商品（可选）
  const sampleProducts = [
    {
      title: '汽车香水摆件',
      description: '高档汽车香水，持久留香，优雅外观',
      price: 89.00,
      originalPrice: 129.00,
      stock: 100,
      sold: 256,
      status: 'ACTIVE',
      categoryId: 'cat1',
      images: {
        create: [
          { url: 'https://via.placeholder.com/400', sortOrder: 0 },
        ],
      },
    },
    {
      title: '机械键盘青轴',
      description: '87键机械键盘，青轴手感清脆，RGB背光',
      price: 299.00,
      originalPrice: 399.00,
      stock: 50,
      sold: 128,
      status: 'ACTIVE',
      categoryId: 'cat2',
      images: {
        create: [
          { url: 'https://via.placeholder.com/400', sortOrder: 0 },
        ],
      },
    },
    {
      title: '动漫手办模型',
      description: '精美手办，做工精致，收藏必备',
      price: 199.00,
      stock: 30,
      sold: 89,
      status: 'ACTIVE',
      categoryId: 'cat3',
      images: {
        create: [
          { url: 'https://via.placeholder.com/400', sortOrder: 0 },
        ],
      },
    },
    {
      title: '星空挂饰装饰',
      description: '梦幻星空挂饰，适合卧室、书房装饰',
      price: 59.00,
      originalPrice: 89.00,
      stock: 200,
      sold: 432,
      status: 'ACTIVE',
      categoryId: 'cat4',
      images: {
        create: [
          { url: 'https://via.placeholder.com/400', sortOrder: 0 },
        ],
      },
    },
  ];

  for (const product of sampleProducts) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('示例商品创建完成！');
  console.log('数据库初始化完成！');
}

main()
  .catch((e) => {
    console.error('初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
