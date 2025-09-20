'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'

interface Product {
  id: string
  name: string
  type: string
  category: string
  riskLevel: string
  expectedReturn: number
  minInvestment: number
  currentPrice: number
  description: string
  isActive: boolean
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'REKSADANA',
    riskLevel: 'KONSERVATIF',
    expectedReturn: '',
    minInvestment: '',
    currentPrice: '',
    description: '',
    isActive: true
  })

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`)
      if (response.ok) {
        const productData = await response.json()
        setProduct(productData)
        setFormData({
          name: productData.name,
          type: productData.type,
          riskLevel: productData.riskLevel,
          expectedReturn: productData.expectedReturn.toString(),
          minInvestment: productData.minInvestment.toString(),
          currentPrice: productData.currentPrice.toString(),
          description: productData.description,
          isActive: productData.isActive
        })
      } else {
        alert('Produk tidak ditemukan')
        router.push('/admin/products')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      alert('Terjadi kesalahan saat mengambil data produk')
    }
  }, [productId, router])

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId, fetchProduct])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/admin/products')
        router.refresh() // Refresh the page to show updated product
      } else {
        const error = await response.json()
        alert(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Terjadi kesalahan saat memperbarui produk')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Memuat data produk...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/products')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Produk Investasi</h1>
            <p className="mt-2 text-gray-600">
              Perbarui informasi produk investasi
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Produk</CardTitle>
          <CardDescription>
            Edit detail produk investasi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Produk *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Contoh: Reksa Dana Pasar Uang Syariah"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Jenis Produk *</Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="REKSADANA">Reksa Dana</option>
                  <option value="OBLIGASI">Obligasi</option>
                  <option value="SBN">Surat Berharga Negara</option>
                </select>
              </div>



              <div className="space-y-2">
                <Label htmlFor="riskLevel">Tingkat Risiko *</Label>
                <select
                  id="riskLevel"
                  name="riskLevel"
                  value={formData.riskLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="KONSERVATIF">Konservatif</option>
                  <option value="MODERAT">Moderat</option>
                  <option value="AGRESIF">Agresif</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedReturn">Return yang Diharapkan (%) *</Label>
                <Input
                  id="expectedReturn"
                  name="expectedReturn"
                  type="number"
                  step="0.1"
                  value={formData.expectedReturn}
                  onChange={handleChange}
                  placeholder="Contoh: 4.5"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minInvestment">Investasi Minimum (Rp) *</Label>
                <Input
                  id="minInvestment"
                  name="minInvestment"
                  type="number"
                  value={formData.minInvestment}
                  onChange={handleChange}
                  placeholder="Contoh: 10000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentPrice">Harga Saat Ini (Rp) *</Label>
                <Input
                  id="currentPrice"
                  name="currentPrice"
                  type="number"
                  value={formData.currentPrice}
                  onChange={handleChange}
                  placeholder="Contoh: 1000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Status Produk</Label>
                <div className="flex items-center space-x-2">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="isActive" className="text-sm text-gray-700">
                    Produk Aktif
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Produk *</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jelaskan detail produk investasi ini..."
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/products')}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
