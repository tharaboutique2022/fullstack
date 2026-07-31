import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

const DEFAULT_TIME_SLOTS = [
  '07:00 AM',
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
];

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80';

const DEPARTMENT_IMAGES = {
  women: 'https://images.unsplash.com/photo-1483985988355-763728fa195b?auto=format&fit=crop&w=800&q=80',
  men: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80',
  kids: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80',
  beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?auto=format&fit=crop&w=800&q=80',
} as const;

async function upsertProductCategory(input: {
  name: string;
  slug: string;
  kind: 'department' | 'group' | 'brand' | 'leaf';
  parentId?: string | null;
  sortOrder?: number;
  imageUrl?: string | null;
}) {
  const parentId = input.parentId ?? null;
  const existing = await prisma.productCategory.findFirst({
    where: { slug: input.slug, parentId },
  });

  const data = {
    name: input.name,
    kind: input.kind,
    sortOrder: input.sortOrder ?? 0,
    imageUrl: input.imageUrl ?? null,
    isActive: true,
  };

  if (existing) {
    return prisma.productCategory.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.productCategory.create({
    data: {
      ...data,
      slug: input.slug,
      parentId,
    },
  });
}

async function seedProductCatalog() {
  const women = await upsertProductCategory({
    name: 'Women',
    slug: 'women',
    kind: 'department',
    sortOrder: 1,
    imageUrl: DEPARTMENT_IMAGES.women,
  });
  const men = await upsertProductCategory({
    name: 'Men',
    slug: 'men',
    kind: 'department',
    sortOrder: 2,
    imageUrl: DEPARTMENT_IMAGES.men,
  });
  const kids = await upsertProductCategory({
    name: 'Kids',
    slug: 'kids',
    kind: 'department',
    sortOrder: 3,
    imageUrl: DEPARTMENT_IMAGES.kids,
  });
  const beauty = await upsertProductCategory({
    name: 'Beauty',
    slug: 'beauty',
    kind: 'department',
    sortOrder: 4,
    imageUrl: DEPARTMENT_IMAGES.beauty,
  });

  const womenBrands = await upsertProductCategory({
    name: 'Brands',
    slug: 'brands',
    kind: 'group',
    parentId: women.id,
    sortOrder: 1,
  });
  const womenWestern = await upsertProductCategory({
    name: 'Western Wear',
    slug: 'western-wear',
    kind: 'group',
    parentId: women.id,
    sortOrder: 2,
  });
  const womenEthnic = await upsertProductCategory({
    name: 'Ethnic Wear',
    slug: 'ethnic-wear',
    kind: 'group',
    parentId: women.id,
    sortOrder: 3,
  });

  await upsertProductCategory({ name: 'Lakme', slug: 'lakme', kind: 'brand', parentId: womenBrands.id, sortOrder: 1 });
  await upsertProductCategory({ name: 'Maybelline', slug: 'maybelline', kind: 'brand', parentId: womenBrands.id, sortOrder: 2 });
  await upsertProductCategory({ name: 'MAC', slug: 'mac', kind: 'brand', parentId: womenBrands.id, sortOrder: 3 });

  const womenDresses = await upsertProductCategory({
    name: 'Dresses',
    slug: 'dresses',
    kind: 'leaf',
    parentId: womenWestern.id,
    sortOrder: 1,
  });
  const womenTops = await upsertProductCategory({
    name: 'Tops',
    slug: 'tops',
    kind: 'leaf',
    parentId: womenWestern.id,
    sortOrder: 2,
  });
  const womenKurtis = await upsertProductCategory({
    name: 'Kurtis',
    slug: 'kurtis',
    kind: 'leaf',
    parentId: womenEthnic.id,
    sortOrder: 1,
  });

  const menBrands = await upsertProductCategory({
    name: 'Brands',
    slug: 'brands',
    kind: 'group',
    parentId: men.id,
    sortOrder: 1,
  });
  const menShirts = await upsertProductCategory({
    name: 'Shirt',
    slug: 'shirt',
    kind: 'group',
    parentId: men.id,
    sortOrder: 2,
  });
  const menTrousers = await upsertProductCategory({
    name: 'Trousers',
    slug: 'trousers',
    kind: 'group',
    parentId: men.id,
    sortOrder: 3,
  });
  const menEthnic = await upsertProductCategory({
    name: 'Ethnic Wear',
    slug: 'ethnic-wear',
    kind: 'group',
    parentId: men.id,
    sortOrder: 4,
  });

  await upsertProductCategory({ name: 'Adidas', slug: 'adidas', kind: 'brand', parentId: menBrands.id, sortOrder: 1 });
  await upsertProductCategory({ name: 'Allen Solly', slug: 'allen-solly', kind: 'brand', parentId: menBrands.id, sortOrder: 2 });
  await upsertProductCategory({ name: 'Peter England', slug: 'peter-england', kind: 'brand', parentId: menBrands.id, sortOrder: 3 });
  await upsertProductCategory({ name: 'Armani', slug: 'armani', kind: 'brand', parentId: menBrands.id, sortOrder: 4 });

  const menCasualShirts = await upsertProductCategory({
    name: 'Casual Shirts',
    slug: 'casual-shirts',
    kind: 'leaf',
    parentId: menShirts.id,
    sortOrder: 1,
  });
  const menFormalShirts = await upsertProductCategory({
    name: 'Formal Shirts',
    slug: 'formal-shirts',
    kind: 'leaf',
    parentId: menShirts.id,
    sortOrder: 2,
  });
  const menCasualTrousers = await upsertProductCategory({
    name: 'Casual Trousers',
    slug: 'casual-trousers',
    kind: 'leaf',
    parentId: menTrousers.id,
    sortOrder: 1,
  });

  const kidsClothing = await upsertProductCategory({
    name: 'Clothing',
    slug: 'clothing',
    kind: 'group',
    parentId: kids.id,
    sortOrder: 1,
  });
  const kidsDresses = await upsertProductCategory({
    name: 'Kids Dresses',
    slug: 'kids-dresses',
    kind: 'leaf',
    parentId: kidsClothing.id,
    sortOrder: 1,
  });

  const beautyBrands = await upsertProductCategory({
    name: 'Brands',
    slug: 'brands',
    kind: 'group',
    parentId: beauty.id,
    sortOrder: 1,
  });
  const beautyMakeup = await upsertProductCategory({
    name: 'Makeup Items',
    slug: 'makeup-items',
    kind: 'group',
    parentId: beauty.id,
    sortOrder: 2,
  });
  const beautySkincare = await upsertProductCategory({
    name: 'Skincare',
    slug: 'skincare',
    kind: 'group',
    parentId: beauty.id,
    sortOrder: 3,
  });

  await upsertProductCategory({ name: 'NYX', slug: 'nyx', kind: 'brand', parentId: beautyBrands.id, sortOrder: 1 });
  await upsertProductCategory({ name: 'Urban Decay', slug: 'urban-decay', kind: 'brand', parentId: beautyBrands.id, sortOrder: 2 });

  const lipstick = await upsertProductCategory({
    name: 'Lipstick',
    slug: 'lipstick',
    kind: 'leaf',
    parentId: beautyMakeup.id,
    sortOrder: 1,
  });
  const foundation = await upsertProductCategory({
    name: 'Foundation',
    slug: 'foundation',
    kind: 'leaf',
    parentId: beautyMakeup.id,
    sortOrder: 2,
  });
  const serum = await upsertProductCategory({
    name: 'Serum',
    slug: 'serum',
    kind: 'leaf',
    parentId: beautySkincare.id,
    sortOrder: 1,
  });

  const sampleProducts = [
    {
      categoryId: menCasualShirts.id,
      brand: 'Adidas',
      name: 'Adidas Casual Shirt',
      slug: 'adidas-casual-shirt',
      price: 2399,
      description: 'Branded casual shirt for men',
    },
    {
      categoryId: menFormalShirts.id,
      brand: 'Peter England',
      name: 'Peter England Formal Shirt',
      slug: 'peter-england-formal-shirt',
      price: 1899,
      description: 'Slim fit formal shirt',
    },
    {
      categoryId: menCasualTrousers.id,
      brand: 'Allen Solly',
      name: 'Allen Solly Chinos',
      slug: 'allen-solly-chinos',
      price: 2199,
      description: 'Comfort stretch chinos',
    },
    {
      categoryId: womenDresses.id,
      brand: 'Thara Boutique',
      name: 'Floral Midi Dress',
      slug: 'floral-midi-dress',
      price: 1599,
      description: 'Lightweight summer dress',
    },
    {
      categoryId: womenTops.id,
      brand: 'Maybelline',
      name: 'Casual Cotton Top',
      slug: 'casual-cotton-top',
      price: 899,
      description: 'Everyday cotton top',
    },
    {
      categoryId: womenKurtis.id,
      brand: 'Thara Boutique',
      name: 'Printed Kurti',
      slug: 'printed-kurti',
      price: 1299,
      description: 'Festive printed kurti',
    },
    {
      categoryId: kidsDresses.id,
      brand: 'Thara Boutique',
      name: 'Kids Party Dress',
      slug: 'kids-party-dress',
      price: 999,
      description: 'Party wear dress for kids',
    },
    {
      categoryId: lipstick.id,
      brand: 'MAC',
      name: 'Velvet Matte Lipstick',
      slug: 'velvet-matte-lipstick',
      price: 528,
      description: 'Long-lasting matte lipstick',
    },
    {
      categoryId: foundation.id,
      brand: 'Lakme',
      name: 'Glow Foundation',
      slug: 'glow-foundation',
      price: 646,
      description: 'Radiant finish foundation',
    },
    {
      categoryId: serum.id,
      brand: 'NYX',
      name: 'Hydra Boost Serum',
      slug: 'hydra-boost-serum',
      price: 799,
      description: 'Hydrating daily serum',
    },
  ] as const;

  for (const product of sampleProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        categoryId: product.categoryId,
        brand: product.brand,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: PLACEHOLDER_IMAGE,
        stockStatus: 'in_stock',
        isActive: true,
      },
      create: {
        categoryId: product.categoryId,
        brand: product.brand,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        imageUrl: PLACEHOLDER_IMAGE,
        stockStatus: 'in_stock',
        isActive: true,
      },
    });
  }
}

/** Ensure main shop tiles use kind=department so they appear in the mobile app grid. */
async function repairShopTiles() {
  const shopSlugs = ['women', 'men', 'kids', 'beauty'];

  for (const slug of shopSlugs) {
    await prisma.productCategory.updateMany({
      where: { slug, parentId: null },
      data: { kind: 'department', isActive: true },
    });
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
    }
  }
}

async function main(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@123';
  const adminName = process.env.ADMIN_NAME ?? 'Admin';

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash,
      role: 'admin',
    },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'admin',
    },
  });

  await prisma.cart.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id },
  });

  await prisma.address.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {
      userId: admin.id,
      label: 'Home',
      line1: 'Sholinganallur',
      line2: null,
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600119',
      isDefault: true,
    },
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      userId: admin.id,
      label: 'Home',
      line1: 'Sholinganallur',
      line2: null,
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600119',
      isDefault: true,
    },
  });

  await seedProductCatalog();
  await repairShopTiles();

  const serviceCategories = [
    {
      name: 'Mehandi',
      slug: 'mehandi',
      subtitle: 'Bridal & festive henna artists',
      sortOrder: 1,
      imageUrl: PLACEHOLDER_IMAGE,
    },
    {
      name: 'Makeup',
      slug: 'makeup',
      subtitle: 'Party, bridal & occasion makeup',
      sortOrder: 2,
      imageUrl: PLACEHOLDER_IMAGE,
    },
    {
      name: 'GYM',
      slug: 'gym',
      subtitle: 'Personal training & fitness coaches',
      sortOrder: 3,
      imageUrl: PLACEHOLDER_IMAGE,
    },
  ];

  const categoryBySlug: Record<string, string> = {};

  for (const category of serviceCategories) {
    const row = await prisma.serviceCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    categoryBySlug[row.slug] = row.id;
  }

  const providers = [
    {
      categorySlug: 'mehandi',
      name: 'Nandhini Mehandi',
      slug: 'nandhini-mehandi',
      tagline: 'Bridal mehandi specialist',
      description: 'Traditional and contemporary bridal mehandi with custom motifs.',
      location: 'Anna Nagar, Chennai',
      distanceKm: 2.4,
      rating: 4.8,
      reviewCount: 128,
      audienceTag: 'Women',
      tags: ['Bridal', 'Arabic', 'Traditional'],
      priceFrom: 1500,
      sortOrder: 1,
      packages: [
        {
          name: 'Basic',
          description: 'Hands & feet basic design',
          priceMin: 1500,
          priceMax: 2500,
          durationMinutes: 90,
        },
        {
          name: 'Advance',
          description: 'Full bridal mehandi with intricate motifs',
          priceMin: 5000,
          priceMax: 12000,
          durationMinutes: 240,
        },
      ],
    },
    {
      categorySlug: 'makeup',
      name: 'Tanu Makeup Studio',
      slug: 'tanu-makeup-studio',
      tagline: 'HD & airbrush makeup artist',
      description: 'Party, engagement and bridal makeup with premium products.',
      location: 'T Nagar, Chennai',
      distanceKm: 3.1,
      rating: 4.9,
      reviewCount: 214,
      audienceTag: 'Women',
      tags: ['Bridal', 'Party', 'HD Makeup'],
      priceFrom: 2000,
      sortOrder: 1,
      packages: [
        {
          name: 'Basic',
          description: 'Party makeup with basic hair styling',
          priceMin: 2000,
          priceMax: 3500,
          durationMinutes: 60,
        },
        {
          name: 'Advance',
          description: 'Bridal makeup with draping & hair styling',
          priceMin: 8000,
          priceMax: 15000,
          durationMinutes: 180,
        },
      ],
    },
    {
      categorySlug: 'gym',
      name: 'FitZone Personal Training',
      slug: 'fitzone-personal-training',
      tagline: 'Certified personal trainers',
      description: 'Weight loss, strength training and nutrition guidance.',
      location: 'Velachery, Chennai',
      distanceKm: 4.5,
      rating: 4.6,
      reviewCount: 89,
      audienceTag: 'All',
      tags: ['Weight Loss', 'Strength', 'Nutrition'],
      priceFrom: 500,
      sortOrder: 1,
      packages: [
        {
          name: 'Basic',
          description: 'Single session personal training',
          priceMin: 500,
          priceMax: 800,
          durationMinutes: 60,
        },
        {
          name: 'Advance',
          description: 'Monthly package with diet plan',
          priceMin: 5000,
          priceMax: 8000,
          durationMinutes: 60,
        },
      ],
    },
  ];

  for (const provider of providers) {
    const categoryId = categoryBySlug[provider.categorySlug];
    if (!categoryId) continue;

    const existing = await prisma.serviceProvider.findUnique({
      where: { slug: provider.slug },
      include: { packages: true, timeSlots: true },
    });

    if (existing) {
      await prisma.serviceProvider.update({
        where: { id: existing.id },
        data: {
          categoryId,
          name: provider.name,
          tagline: provider.tagline,
          description: provider.description,
          imageUrl: PLACEHOLDER_IMAGE,
          location: provider.location,
          distanceKm: provider.distanceKm,
          rating: provider.rating,
          reviewCount: provider.reviewCount,
          audienceTag: provider.audienceTag,
          tags: provider.tags,
          priceFrom: provider.priceFrom,
          sortOrder: provider.sortOrder,
        },
      });

      if (!existing.timeSlots.length) {
        await prisma.serviceProviderTimeSlot.createMany({
          data: DEFAULT_TIME_SLOTS.map((slotTime, index) => ({
            providerId: existing.id,
            slotTime,
            sortOrder: index,
          })),
        });
      }

      for (const [index, pkg] of provider.packages.entries()) {
        const existingPkg = existing.packages.find((row) => row.name === pkg.name);
        if (existingPkg) {
          await prisma.servicePackage.update({
            where: { id: existingPkg.id },
            data: {
              description: pkg.description,
              priceMin: pkg.priceMin,
              priceMax: pkg.priceMax,
              durationMinutes: pkg.durationMinutes,
              sortOrder: index,
            },
          });
        } else {
          await prisma.servicePackage.create({
            data: {
              providerId: existing.id,
              name: pkg.name,
              description: pkg.description,
              priceMin: pkg.priceMin,
              priceMax: pkg.priceMax,
              durationMinutes: pkg.durationMinutes,
              sortOrder: index,
            },
          });
        }
      }
      continue;
    }

    await prisma.serviceProvider.create({
      data: {
        categoryId,
        name: provider.name,
        slug: provider.slug,
        tagline: provider.tagline,
        description: provider.description,
        imageUrl: PLACEHOLDER_IMAGE,
        location: provider.location,
        distanceKm: provider.distanceKm,
        rating: provider.rating,
        reviewCount: provider.reviewCount,
        audienceTag: provider.audienceTag,
        tags: provider.tags,
        priceFrom: provider.priceFrom,
        sortOrder: provider.sortOrder,
        gallery: {
          create: [{ imageUrl: PLACEHOLDER_IMAGE, sortOrder: 0 }],
        },
        timeSlots: {
          create: DEFAULT_TIME_SLOTS.map((slotTime, index) => ({
            slotTime,
            sortOrder: index,
          })),
        },
        packages: {
          create: provider.packages.map((pkg, index) => ({
            name: pkg.name,
            description: pkg.description,
            priceMin: pkg.priceMin,
            priceMax: pkg.priceMax,
            durationMinutes: pkg.durationMinutes,
            sortOrder: index,
          })),
        },
      },
    });
  }

  await prisma.coupon.upsert({
    where: { code: 'THARA10' },
    update: { isActive: true },
    create: {
      code: 'THARA10',
      description: '10% off orders above ₹500',
      discountType: 'percent',
      discountValue: 10,
      minOrderAmount: 500,
      isActive: true,
    },
  });

  console.log('Seed completed');
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
