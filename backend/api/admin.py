from django.contrib import admin

from .models import Brand, Category, Product


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "is_active", "created_at"]
    prepopulated_fields = {"slug": ("name",)}
    list_filter = ["is_active"]
    search_fields = ["name"]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "parent", "is_active", "created_at"]
    prepopulated_fields = {"slug": ("name",)}
    list_filter = ["is_active", "parent"]
    search_fields = ["name"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "brand", "category", "price", "stock", "is_featured", "is_active"]
    prepopulated_fields = {"slug": ("name",)}
    list_filter = ["is_active", "is_featured", "category", "brand"]
    search_fields = ["name", "description"]
    readonly_fields = ["created_at", "updated_at"]
