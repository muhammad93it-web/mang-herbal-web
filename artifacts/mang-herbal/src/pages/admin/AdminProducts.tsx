import React, { useState } from 'react';
import { useAdminGetProducts, useAdminDeleteProduct, getAdminGetProductsQueryKey, useAdminCreateProduct, useAdminUpdateProduct } from '@workspace/api-client-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PackageSearch, Plus, Trash2, Edit, X, Image as ImageIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useAdminGetProducts();
  const deleteProduct = useAdminDeleteProduct();
  const createProduct = useAdminCreateProduct();
  const updateProduct = useAdminUpdateProduct();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nameCkb: '', nameAr: '', nameEn: '',
    descCkb: '', descAr: '', descEn: '',
    price: 0, oldPrice: 0,
    categorySlug: 'skincare',
    imageUrl: '', badge: '',
    inStock: true, isFeatured: false
  });

  const openNew = () => {
    setEditingId(null);
    setFormData({
      nameCkb: '', nameAr: '', nameEn: '',
      descCkb: '', descAr: '', descEn: '',
      price: 0, oldPrice: 0,
      categorySlug: 'skincare',
      imageUrl: '', badge: '',
      inStock: true, isFeatured: false
    });
    setIsModalOpen(true);
  };

  const openEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      nameCkb: product.nameCkb, nameAr: product.nameAr, nameEn: product.nameEn,
      descCkb: product.descCkb, descAr: product.descAr, descEn: product.descEn,
      price: product.price, oldPrice: product.oldPrice || 0,
      categorySlug: product.categorySlug,
      imageUrl: product.imageUrl || '', badge: product.badge || '',
      inStock: product.inStock, isFeatured: product.isFeatured
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct.mutate({ id }, {
        onSuccess: () => {
          toast.success('Product deleted');
          queryClient.invalidateQueries({ queryKey: getAdminGetProductsQueryKey() });
        }
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      oldPrice: formData.oldPrice || null,
      imageUrl: formData.imageUrl || null,
      badge: formData.badge || null,
    };

    if (editingId) {
      updateProduct.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          toast.success('Product updated');
          setIsModalOpen(false);
          queryClient.invalidateQueries({ queryKey: getAdminGetProductsQueryKey() });
        }
      });
    } else {
      createProduct.mutate({ data: payload }, {
        onSuccess: () => {
          toast.success('Product created');
          setIsModalOpen(false);
          queryClient.invalidateQueries({ queryKey: getAdminGetProductsQueryKey() });
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 md:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-border/50 pb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground">
                Products Management
              </h1>
            </div>
          </div>
          
          <Button onClick={openNew} className="shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="p-8 text-center col-span-full">Loading...</div>
          ) : products?.map(product => (
            <div key={product.id} className="bg-card border border-border/50 rounded-2xl overflow-hidden flex flex-col hover:border-primary/30 transition-colors">
              <div className="aspect-square bg-secondary relative">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.nameEn} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><ImageIcon className="w-12 h-12" /></div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <button onClick={() => openEdit(product)} className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shadow-sm hover:text-primary"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(product.id)} className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shadow-sm hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-xs text-primary mb-1">{product.categorySlug}</span>
                <h3 className="font-bold text-lg mb-1 line-clamp-1">{product.nameEn}</h3>
                <div className="flex justify-between items-center mt-auto pt-4">
                  <span className="font-bold text-foreground">{formatPrice(product.price)}</span>
                  <div className="flex gap-2">
                    {product.isFeatured && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded">Featured</span>}
                    {!product.inStock && <span className="text-[10px] bg-destructive/20 text-destructive px-2 py-0.5 rounded">Out</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Name (Kurdish)</Label>
                <Input required value={formData.nameCkb} onChange={e => setFormData({...formData, nameCkb: e.target.value})} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Name (Arabic)</Label>
                <Input required value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Name (English)</Label>
                <Input required value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="bg-background" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Desc (Kurdish)</Label>
                <Textarea required value={formData.descCkb} onChange={e => setFormData({...formData, descCkb: e.target.value})} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Desc (Arabic)</Label>
                <Textarea required value={formData.descAr} onChange={e => setFormData({...formData, descAr: e.target.value})} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Desc (English)</Label>
                <Textarea required value={formData.descEn} onChange={e => setFormData({...formData, descEn: e.target.value})} className="bg-background" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (IQD)</Label>
                <Input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Old Price (IQD - Optional)</Label>
                <Input type="number" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: Number(e.target.value)})} className="bg-background" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category Slug</Label>
                <Input required value={formData.categorySlug} onChange={e => setFormData({...formData, categorySlug: e.target.value})} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Badge</Label>
                <Input value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} className="bg-background" placeholder="e.g. New" />
              </div>
            </div>

            <div className="flex gap-8 border-t border-border/50 pt-6">
              <div className="flex items-center space-x-2">
                <Switch id="stock" checked={formData.inStock} onCheckedChange={c => setFormData({...formData, inStock: c})} />
                <Label htmlFor="stock">In Stock</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="feat" checked={formData.isFeatured} onCheckedChange={c => setFormData({...formData, isFeatured: c})} />
                <Label htmlFor="feat">Featured</Label>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-border/50">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>Save Product</Button>
            </div>

          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
