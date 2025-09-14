'use client'

import { useState } from 'react'

interface DeleteProductButtonProps {
  productId: string
  productName: string
  onDeleted?: () => void
}

export function DeleteProductButton({ productId, productName, onDeleted }: DeleteProductButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setShowConfirm(false)
        if (onDeleted) {
          onDeleted()
        } else {
          // Fallback to page reload if no callback provided
          window.location.reload()
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Terjadi kesalahan saat menghapus produk')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Terjadi kesalahan saat menghapus produk')
    } finally {
      setLoading(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Konfirmasi Hapus Produk
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Apakah Anda yakin ingin menghapus produk <strong>&quot;{productName}&quot;</strong>? 
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={loading}
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Menghapus...' : 'Hapus'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button 
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:text-red-900"
    >
      Hapus
    </button>
  )
}
