'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'REKSADANA',
    riskLevel: 'KONSERVATIF',
    expectedReturn: '',
    minInvestment: '',
    currentPrice: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        // Show success message
        alert('Produk berhasil ditambahkan!')
        router.push('/admin/products')
      } else {
        const error = await response.json()
        alert(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Terjadi kesalahan saat membuat produk')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
            <h1 className="text-3xl font-bold text-gray-900">Tambah Produk Investasi</h1>
            <p className="mt-2 text-gray-600">
              Buat produk investasi baru untuk platform
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Produk</CardTitle>
          <CardDescription>
            Isi detail produk investasi yang akan ditambahkan
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
                  <option value="CRYPTO">Crypto</option>
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
                {loading ? 'Menyimpan...' : 'Simpan Produk'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
