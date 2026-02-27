"""Seed the database with sample mobile phone data."""

from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from api.models import Brand, Category, Product


BRANDS = [
    "Apple",
    "Samsung",
    "OnePlus",
    "Xiaomi",
    "Realme",
    "Vivo",
    "Oppo",
    "Motorola",
    "Nothing",
    "Google",
]

CATEGORIES = [
    {
        "name": "Smartphones",
        "children": [
            "Flagship",
            "Mid Range",
            "Budget",
            "Gaming Phones",
            "Foldable Phones",
        ],
    },
    {
        "name": "Accessories",
        "children": [
            "Cases & Covers",
            "Screen Protectors",
            "Chargers & Cables",
            "Earbuds & Headphones",
            "Power Banks",
        ],
    },
    {
        "name": "Tablets",
        "children": ["Android Tablets", "iPads", "Windows Tablets"],
    },
    {
        "name": "Wearables",
        "children": ["Smartwatches", "Fitness Bands"],
    },
]

PRODUCTS = [
    # Flagship Smartphones
    {"name": "iPhone 16 Pro Max", "brand": "Apple", "category": "Flagship", "price": 144900, "discount": 5, "rating": 4.7, "reviews": 2340, "featured": True, "stock": 45},
    {"name": "Samsung Galaxy S25 Ultra", "brand": "Samsung", "category": "Flagship", "price": 134999, "discount": 8, "rating": 4.6, "reviews": 1890, "featured": True, "stock": 38},
    {"name": "OnePlus 13", "brand": "OnePlus", "category": "Flagship", "price": 69999, "discount": 10, "rating": 4.5, "reviews": 3200, "featured": True, "stock": 60},
    {"name": "Google Pixel 9 Pro", "brand": "Google", "category": "Flagship", "price": 109999, "discount": 12, "rating": 4.5, "reviews": 980, "featured": True, "stock": 25},
    {"name": "Nothing Phone (3)", "brand": "Nothing", "category": "Flagship", "price": 49999, "discount": 0, "rating": 4.3, "reviews": 560, "featured": False, "stock": 70},
    # Mid Range
    {"name": "Samsung Galaxy A55", "brand": "Samsung", "category": "Mid Range", "price": 29999, "discount": 15, "rating": 4.3, "reviews": 4500, "featured": True, "stock": 120},
    {"name": "Xiaomi 14T", "brand": "Xiaomi", "category": "Mid Range", "price": 34999, "discount": 10, "rating": 4.2, "reviews": 2100, "featured": False, "stock": 80},
    {"name": "OnePlus Nord 4", "brand": "OnePlus", "category": "Mid Range", "price": 29999, "discount": 12, "rating": 4.4, "reviews": 5600, "featured": True, "stock": 95},
    {"name": "Motorola Edge 50 Pro", "brand": "Motorola", "category": "Mid Range", "price": 31999, "discount": 18, "rating": 4.1, "reviews": 1200, "featured": False, "stock": 55},
    {"name": "Vivo V40 Pro", "brand": "Vivo", "category": "Mid Range", "price": 34999, "discount": 8, "rating": 4.2, "reviews": 890, "featured": False, "stock": 65},
    # Budget
    {"name": "Realme Narzo 70 Pro", "brand": "Realme", "category": "Budget", "price": 14999, "discount": 10, "rating": 4.1, "reviews": 8900, "featured": True, "stock": 200},
    {"name": "Xiaomi Redmi Note 14 Pro", "brand": "Xiaomi", "category": "Budget", "price": 18999, "discount": 15, "rating": 4.3, "reviews": 12000, "featured": True, "stock": 250},
    {"name": "Samsung Galaxy M35", "brand": "Samsung", "category": "Budget", "price": 16999, "discount": 12, "rating": 4.0, "reviews": 6700, "featured": False, "stock": 180},
    {"name": "Oppo A3 Pro", "brand": "Oppo", "category": "Budget", "price": 17999, "discount": 5, "rating": 4.0, "reviews": 3400, "featured": False, "stock": 140},
    # Accessories
    {"name": "Apple AirPods Pro 2", "brand": "Apple", "category": "Earbuds & Headphones", "price": 24900, "discount": 10, "rating": 4.8, "reviews": 15000, "featured": True, "stock": 300},
    {"name": "Samsung 25W Travel Adapter", "brand": "Samsung", "category": "Chargers & Cables", "price": 1499, "discount": 20, "rating": 4.4, "reviews": 5600, "featured": False, "stock": 500},
    {"name": "OnePlus Buds 3", "brand": "OnePlus", "category": "Earbuds & Headphones", "price": 5499, "discount": 15, "rating": 4.3, "reviews": 3200, "featured": False, "stock": 200},
    {"name": "Xiaomi 20000mAh Power Bank", "brand": "Xiaomi", "category": "Power Banks", "price": 1999, "discount": 10, "rating": 4.5, "reviews": 9800, "featured": True, "stock": 400},
    # Wearables
    {"name": "Apple Watch Ultra 2", "brand": "Apple", "category": "Smartwatches", "price": 89900, "discount": 5, "rating": 4.7, "reviews": 1200, "featured": True, "stock": 30},
    {"name": "Samsung Galaxy Watch 7", "brand": "Samsung", "category": "Smartwatches", "price": 29999, "discount": 12, "rating": 4.4, "reviews": 2300, "featured": False, "stock": 50},
]


class Command(BaseCommand):
    help = "Seed the database with sample mobile shop data"

    def handle(self, *args, **options):
        self.stdout.write("Seeding brands...")
        brand_map = {}
        for name in BRANDS:
            brand, _ = Brand.objects.get_or_create(
                slug=slugify(name),
                defaults={"name": name},
            )
            brand_map[name] = brand

        self.stdout.write("Seeding categories...")
        cat_map = {}
        for cat_data in CATEGORIES:
            parent, _ = Category.objects.get_or_create(
                slug=slugify(cat_data["name"]),
                defaults={"name": cat_data["name"]},
            )
            cat_map[cat_data["name"]] = parent
            for child_name in cat_data["children"]:
                child, _ = Category.objects.get_or_create(
                    slug=slugify(child_name),
                    defaults={"name": child_name, "parent": parent},
                )
                cat_map[child_name] = child

        self.stdout.write("Seeding products...")
        for p in PRODUCTS:
            slug = slugify(p["name"])
            Product.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": p["name"],
                    "brand": brand_map.get(p["brand"]),
                    "category": cat_map.get(p["category"]),
                    "price": Decimal(str(p["price"])),
                    "discount_percent": Decimal(str(p["discount"])),
                    "rating": Decimal(str(p["rating"])),
                    "review_count": p["reviews"],
                    "stock": p["stock"],
                    "is_featured": p["featured"],
                    "image_url": f"https://picsum.photos/seed/{slug}/400/400",
                    "description": f"The latest {p['name']} from {p['brand']}. Premium quality with excellent performance.",
                },
            )

        self.stdout.write(self.style.SUCCESS(
            f"Done! {Brand.objects.count()} brands, "
            f"{Category.objects.count()} categories, "
            f"{Product.objects.count()} products"
        ))
