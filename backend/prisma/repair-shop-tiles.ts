import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const shopSlugs = ['women', 'men', 'kids', 'beauty'];

  for (const slug of shopSlugs) {
    const result = await prisma.productCategory.updateMany({
      where: { slug, parentId: null },
      data: { kind: 'department', isActive: true },
    });
    if (result.count) console.log(`Fixed shop tile: ${slug}`);
  }

  const orphanRoots = await prisma.productCategory.findMany({
    where: { parentId: null, kind: { not: 'department' } },
    include: { children: true },
  });

  for (const root of orphanRoots) {
    if (root.children.length > 0 || root.imageUrl) {
      await prisma.productCategory.update({
        where: { id: root.id },
        data: { kind: 'department' },
      });
      console.log(`Promoted to shop tile: ${root.name}`);
    } else {
      console.log(`Skipped (not a shop tile): ${root.name} (${root.kind})`);
    }
  }

  const visible = await prisma.productCategory.findMany({
    where: { parentId: null, kind: 'department', isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { name: true, slug: true },
  });

  console.log('\nShop tiles visible in app:');
  visible.forEach((item) => console.log(`  - ${item.name} (${item.slug})`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
