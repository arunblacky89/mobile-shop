"""Seed the catalog with enterprise-grade sample data."""

from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from catalog.models import Brand, Category, Product, ProductImage, ProductVariant


BRANDS = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Realme", "Vivo", "Oppo", "Motorola", "Nothing", "Google"]

CATEGORIES = [
    {"name": "Smartphones", "children": ["Flagship", "Mid Range", "Budget", "Gaming Phones", "Foldable Phones"]},
    {"name": "Accessories", "children": ["Cases & Covers", "Screen Protectors", "Chargers & Cables", "Earbuds & Headphones", "Power Banks"]},
    {"name": "Tablets", "children": ["Android Tablets", "iPads", "Windows Tablets"]},
    {"name": "Wearables", "children": ["Smartwatches", "Fitness Bands"]},
]

PRODUCTS = [
    # ── Flagships ──
    {"title": "iPhone 16 Pro Max 256GB", "brand": "Apple", "cat": "Flagship",
     "variants": [
         {"sku": "APL-IP16PM-256-NT", "price": 144900, "mrp": 154900, "attrs": {"color": "Natural Titanium", "storage": "256GB", "ram": "8GB"}, "stock": 45},
         {"sku": "APL-IP16PM-256-BT", "price": 144900, "mrp": 154900, "attrs": {"color": "Black Titanium", "storage": "256GB", "ram": "8GB"}, "stock": 30},
         {"sku": "APL-IP16PM-512-NT", "price": 164900, "mrp": 174900, "attrs": {"color": "Natural Titanium", "storage": "512GB", "ram": "8GB"}, "stock": 20},
     ]},
    {"title": "Samsung Galaxy S25 Ultra", "brand": "Samsung", "cat": "Flagship",
     "variants": [
         {"sku": "SAM-S25U-256-BK", "price": 134999, "mrp": 149999, "attrs": {"color": "Titanium Black", "storage": "256GB", "ram": "12GB"}, "stock": 38},
         {"sku": "SAM-S25U-512-GY", "price": 149999, "mrp": 164999, "attrs": {"color": "Titanium Gray", "storage": "512GB", "ram": "12GB"}, "stock": 15},
     ]},
    {"title": "OnePlus 13", "brand": "OnePlus", "cat": "Flagship",
     "variants": [
         {"sku": "OP-13-256-BK", "price": 69999, "mrp": 74999, "attrs": {"color": "Midnight Ocean", "storage": "256GB", "ram": "12GB"}, "stock": 60},
         {"sku": "OP-13-512-GN", "price": 79999, "mrp": 84999, "attrs": {"color": "Arctic Dawn", "storage": "512GB", "ram": "16GB"}, "stock": 25},
     ]},
    {"title": "Google Pixel 9 Pro", "brand": "Google", "cat": "Flagship",
     "variants": [
         {"sku": "GOO-PX9P-256-OB", "price": 109999, "mrp": 119999, "attrs": {"color": "Obsidian", "storage": "256GB", "ram": "16GB"}, "stock": 25},
     ]},
    {"title": "Nothing Phone (3)", "brand": "Nothing", "cat": "Flagship",
     "variants": [
         {"sku": "NTH-PH3-256-WH", "price": 49999, "mrp": 49999, "attrs": {"color": "White", "storage": "256GB", "ram": "12GB"}, "stock": 70},
     ]},

    # ── Mid Range ──
    {"title": "Samsung Galaxy A55 5G", "brand": "Samsung", "cat": "Mid Range",
     "variants": [
         {"sku": "SAM-A55-128-BL", "price": 29999, "mrp": 34999, "attrs": {"color": "Awesome Iceblue", "storage": "128GB", "ram": "8GB"}, "stock": 120},
         {"sku": "SAM-A55-256-LV", "price": 33999, "mrp": 38999, "attrs": {"color": "Awesome Lilac", "storage": "256GB", "ram": "8GB"}, "stock": 80},
     ]},
    {"title": "OnePlus Nord 4", "brand": "OnePlus", "cat": "Mid Range",
     "variants": [
         {"sku": "OP-N4-256-SL", "price": 29999, "mrp": 34999, "attrs": {"color": "Mercurial Silver", "storage": "256GB", "ram": "8GB"}, "stock": 95},
     ]},
    {"title": "Xiaomi 14T", "brand": "Xiaomi", "cat": "Mid Range",
     "variants": [
         {"sku": "XMI-14T-256-BK", "price": 34999, "mrp": 39999, "attrs": {"color": "Titan Black", "storage": "256GB", "ram": "12GB"}, "stock": 80},
     ]},
    {"title": "Motorola Edge 50 Pro", "brand": "Motorola", "cat": "Mid Range",
     "variants": [
         {"sku": "MOT-E50P-256-BK", "price": 31999, "mrp": 38999, "attrs": {"color": "Black Beauty", "storage": "256GB", "ram": "12GB"}, "stock": 55},
     ]},
    {"title": "Vivo V40 Pro 5G", "brand": "Vivo", "cat": "Mid Range",
     "variants": [
         {"sku": "VIV-V40P-256-BL", "price": 34999, "mrp": 37999, "attrs": {"color": "Tungsten Blue", "storage": "256GB", "ram": "12GB"}, "stock": 65},
     ]},

    # ── Budget ──
    {"title": "Realme Narzo 70 Pro 5G", "brand": "Realme", "cat": "Budget",
     "variants": [
         {"sku": "RLM-N70P-128-GN", "price": 14999, "mrp": 17999, "attrs": {"color": "Glass Green", "storage": "128GB", "ram": "8GB"}, "stock": 200},
     ]},
    {"title": "Xiaomi Redmi Note 14 Pro", "brand": "Xiaomi", "cat": "Budget",
     "variants": [
         {"sku": "XMI-RN14P-128-BL", "price": 18999, "mrp": 21999, "attrs": {"color": "Phantom Purple", "storage": "128GB", "ram": "8GB"}, "stock": 250},
         {"sku": "XMI-RN14P-256-BK", "price": 21999, "mrp": 24999, "attrs": {"color": "Midnight Black", "storage": "256GB", "ram": "8GB"}, "stock": 120},
     ]},
    {"title": "Samsung Galaxy M35 5G", "brand": "Samsung", "cat": "Budget",
     "variants": [
         {"sku": "SAM-M35-128-BL", "price": 16999, "mrp": 19999, "attrs": {"color": "Thunder Blue", "storage": "128GB", "ram": "6GB"}, "stock": 180},
     ]},
    {"title": "Oppo A3 Pro 5G", "brand": "Oppo", "cat": "Budget",
     "variants": [
         {"sku": "OPP-A3P-128-BL", "price": 17999, "mrp": 19999, "attrs": {"color": "Starlight Blue", "storage": "128GB", "ram": "8GB"}, "stock": 140},
     ]},

    # ── Accessories ──
    {"title": "Apple AirPods Pro 2 (USB-C)", "brand": "Apple", "cat": "Earbuds & Headphones",
     "variants": [
         {"sku": "APL-APP2-USBC", "price": 24900, "mrp": 26900, "attrs": {"type": "TWS", "anc": True}, "stock": 300},
     ]},
    {"title": "OnePlus Buds 3", "brand": "OnePlus", "cat": "Earbuds & Headphones",
     "variants": [
         {"sku": "OP-BUDS3-BK", "price": 5499, "mrp": 5999, "attrs": {"type": "TWS", "anc": True, "color": "Metallic Gray"}, "stock": 200},
     ]},
    {"title": "Samsung 25W Travel Adapter", "brand": "Samsung", "cat": "Chargers & Cables",
     "variants": [
         {"sku": "SAM-25W-WH", "price": 1499, "mrp": 1999, "attrs": {"wattage": "25W", "color": "White"}, "stock": 500},
     ]},
    {"title": "Xiaomi 20000mAh Power Bank 3i", "brand": "Xiaomi", "cat": "Power Banks",
     "variants": [
         {"sku": "XMI-PB20K-BK", "price": 1999, "mrp": 2499, "attrs": {"capacity": "20000mAh", "fast_charge": True}, "stock": 400},
     ]},

    # ── Wearables ──
    {"title": "Apple Watch Ultra 2", "brand": "Apple", "cat": "Smartwatches",
     "variants": [
         {"sku": "APL-AWU2-49-OR", "price": 89900, "mrp": 94900, "attrs": {"size": "49mm", "band": "Orange Alpine Loop"}, "stock": 30},
     ]},
    {"title": "Samsung Galaxy Watch 7", "brand": "Samsung", "cat": "Smartwatches",
     "variants": [
         {"sku": "SAM-GW7-44-GN", "price": 29999, "mrp": 33999, "attrs": {"size": "44mm", "color": "Green"}, "stock": 50},
         {"sku": "SAM-GW7-40-SL", "price": 27999, "mrp": 31999, "attrs": {"size": "40mm", "color": "Silver"}, "stock": 45},
     ]},
]


class Command(BaseCommand):
    help = "Seed catalog with enterprise-grade sample data (brands, categories, products, variants, images)"

    def handle(self, *args, **options):
        # ── Brands ──
        self.stdout.write("Seeding brands...")
        brand_map = {}
        for name in BRANDS:
            obj, _ = Brand.objects.get_or_create(slug=slugify(name), defaults={"name": name})
            brand_map[name] = obj

        # ── Categories ──
        self.stdout.write("Seeding categories...")
        cat_map = {}
        for cat in CATEGORIES:
            parent, _ = Category.objects.get_or_create(slug=slugify(cat["name"]), defaults={"name": cat["name"]})
            cat_map[cat["name"]] = parent
            for child_name in cat["children"]:
                child, _ = Category.objects.get_or_create(
                    slug=slugify(child_name), defaults={"name": child_name, "parent": parent}
                )
                cat_map[child_name] = child

        # ── Products + Variants + Images ──
        self.stdout.write("Seeding products...")
        for p in PRODUCTS:
            slug = slugify(p["title"])
            product, created = Product.objects.get_or_create(
                slug=slug,
                defaults={
                    "title": p["title"],
                    "brand": brand_map[p["brand"]],
                    "category": cat_map[p["cat"]],
                    "description": f"The latest {p['title']} from {p['brand']}. Premium build quality, cutting-edge technology.",
                },
            )

            if created:
                # Variants
                for v in p["variants"]:
                    ProductVariant.objects.get_or_create(
                        sku=v["sku"],
                        defaults={
                            "product": product,
                            "price": Decimal(str(v["price"])),
                            "mrp": Decimal(str(v["mrp"])),
                            "attributes": v["attrs"],
                            "stock_qty": v["stock"],
                        },
                    )

                # Images (picsum placeholders)
                for i in range(3):
                    ProductImage.objects.create(
                        product=product,
                        image_url=f"https://picsum.photos/seed/{slug}-{i}/600/600",
                        sort_order=i,
                    )

        stats = (
            f"{Brand.objects.count()} brands, "
            f"{Category.objects.count()} categories, "
            f"{Product.objects.count()} products, "
            f"{ProductVariant.objects.count()} variants, "
            f"{ProductImage.objects.count()} images"
        )
        self.stdout.write(self.style.SUCCESS(f"Done! {stats}"))
