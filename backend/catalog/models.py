from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Category(TimeStampedModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        related_name='children',
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self) -> str:
        return self.name


class Brand(TimeStampedModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)

    def __str__(self) -> str:
        return self.name


class Product(TimeStampedModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    brand = models.ForeignKey(
        Brand,
        on_delete=models.PROTECT,
        related_name='products',
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products',
    )
    is_active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return self.title


class ProductVariant(TimeStampedModel):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='variants',
    )
    sku = models.CharField(max_length=64, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    mrp = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    attributes = models.JSONField(default=dict, blank=True)
    stock_qty = models.PositiveIntegerField(default=0)

    def __str__(self) -> str:
        return f'{self.product.title} - {self.sku}'


class ProductImage(TimeStampedModel):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
    )
    image_url = models.URLField(max_length=1024)
    sort_order = models.PositiveIntegerField(default=0)

    def __str__(self) -> str:
        return f'Image for {self.product.slug} ({self.sort_order})'

from django.db import models

# Create your models here.
