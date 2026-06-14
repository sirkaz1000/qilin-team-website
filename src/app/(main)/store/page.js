'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { Star, ShoppingCart, Code, Palette, Cpu } from 'lucide-react'

export default function StorePage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [requestDetails, setRequestDetails] = useState({
    contactMethod: '',
    contactInfo: '',
    details: ''
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    price: '',
    type: 'SERVICE',
    imageUrl: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/store/items')
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const handleRequest = (item) => {
    setSelectedItem(item)
    setShowRequestModal(true)
  }

  const handleSubmitRequest = async () => {
    if (!requestDetails.contactMethod || !requestDetails.contactInfo || !requestDetails.details) {
      alert('Please fill in all fields')
      return
    }

    try {
      const response = await fetch('/api/store/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          itemType: selectedItem.type || 'SERVICE',
          itemName: selectedItem.title || selectedItem.name,
          contactMethod: requestDetails.contactMethod,
          contactInfo: requestDetails.contactInfo,
          details: requestDetails.details
        })
      })

      if (response.ok) {
        setShowRequestModal(false)
        setSelectedItem(null)
        setRequestDetails({
          contactMethod: '',
          contactInfo: '',
          details: ''
        })
        alert('Request submitted successfully!')
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('Failed to submit request')
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        if (showAddModal) {
          setNewItem({ ...newItem, imageUrl: data.url })
        } else if (showEditModal) {
          setEditingItem({ ...editingItem, imageUrl: data.url })
        }
        setImageFile(file)
      } else {
        alert('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.description || !newItem.price) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('/api/store/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newItem,
          price: parseFloat(newItem.price)
        })
      })

      if (response.ok) {
        setShowAddModal(false)
        setNewItem({
          title: '',
          description: '',
          price: '',
          type: 'SERVICE',
          imageUrl: ''
        })
        setImageFile(null)
        fetchItems()
        alert('Item added successfully!')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to add item')
      }
    } catch (error) {
      console.error('Error adding item:', error)
      alert('Failed to add item')
    }
  }

  const handleEditItem = async () => {
    if (!editingItem.title || !editingItem.description || !editingItem.price) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch(`/api/store/items/${editingItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...editingItem,
          price: parseFloat(editingItem.price)
        })
      })

      if (response.ok) {
        setShowEditModal(false)
        setEditingItem(null)
        fetchItems()
        alert('Item updated successfully!')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to update item')
      }
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Failed to update item')
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      const response = await fetch(`/api/store/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        fetchItems()
        alert('Item deleted successfully!')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to delete item')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  const openEditModal = (item) => {
    setEditingItem({ ...item })
    setImageFile(null)
    setShowEditModal(true)
  }

  const filteredItems = filter === 'all' ? items : items.filter(item => item.type === filter)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">{t('loading')}</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-qilin-blue">{t('store')}</h1>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors flex items-center"
          >
            <span className="mr-2">+</span>
            {t('addItem')}
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-qilin-blue text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('all')}
        </button>
        <button
          onClick={() => setFilter('SERVICE')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'SERVICE'
              ? 'bg-qilin-blue text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('services')}
        </button>
        <button
          onClick={() => setFilter('PRODUCT')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'PRODUCT'
              ? 'bg-qilin-blue text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('products')}
        </button>
      </div>

      {/* Services Section */}
      {filter === 'all' || filter === 'SERVICE' ? (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Cpu className="w-6 h-6 mr-2 text-qilin-blue" />
            {t('ourServices')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems
              .filter(item => item.type === 'SERVICE')
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-qilin-blue font-bold">${item.price}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRequest(item)}
                        className="px-3 py-1 bg-qilin-blue text-white text-sm rounded-lg hover:bg-qilin-dark transition-colors"
                      >
                        {t('order')}
                      </button>
                      {user?.role === 'admin' && (
                        <>
                          <button
                            onClick={() => openEditModal(item)}
                            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors"
                          >
                            {t('edit')}
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                          >
                            {t('delete')}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            {filteredItems.filter(item => item.type === 'SERVICE').length === 0 && (
              <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">{t('noProductsAvailable')}</p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Products Section */}
      {filter === 'all' || filter === 'PRODUCT' ? (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Code className="w-6 h-6 mr-2 text-qilin-blue" />
            {t('digitalProducts')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems
              .filter(item => item.type === 'PRODUCT')
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-qilin-blue font-bold">${item.price}</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.reviews?.length || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleRequest(item)}
                      className="flex-1 px-3 py-2 bg-qilin-blue text-white text-sm rounded-lg hover:bg-qilin-dark transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {t('purchase')}
                    </button>
                    {user?.role === 'admin' && (
                      <>
                        <button
                          onClick={() => openEditModal(item)}
                          className="px-3 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                          {t('edit')}
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                        >
                          {t('delete')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            {filteredItems.filter(item => item.type === 'PRODUCT').length === 0 && (
              <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">{t('noProductsAvailable')}</p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-qilin-blue mb-4">
              {t('request')}: {selectedItem?.title || selectedItem?.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Method
                </label>
                <select
                  value={requestDetails.contactMethod}
                  onChange={(e) => setRequestDetails({ ...requestDetails, contactMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select contact method</option>
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="discord">Discord</option>
                  <option value="telegram">Telegram</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Information
                </label>
                <input
                  type="text"
                  value={requestDetails.contactInfo}
                  onChange={(e) => setRequestDetails({ ...requestDetails, contactInfo: e.target.value })}
                  placeholder="Phone number, email, or username"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Request Details
                </label>
                <textarea
                  value={requestDetails.details}
                  onChange={(e) => setRequestDetails({ ...requestDetails, details: e.target.value })}
                  rows={5}
                  placeholder="Describe your request in detail..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSubmitRequest}
                  className="flex-1 px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => {
                    setShowRequestModal(false)
                    setSelectedItem(null)
                    setRequestDetails({
                      contactMethod: '',
                      contactInfo: '',
                      details: ''
                    })
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-qilin-blue mb-4">{t('addItem')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('title')}
                </label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('title')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('description')}
                </label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder={t('description')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('price')}
                </label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('type')}
                </label>
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="SERVICE">{t('service')}</option>
                  <option value="PRODUCT">{t('product')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('image')}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="w-full px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors cursor-pointer text-center block"
                  >
                    {imageFile ? imageFile.name : t('chooseImage')}
                  </label>
                </div>
                {uploading && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('loading')}</p>
                )}
                {imageFile && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    {t('success')}: {imageFile.name}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddItem}
                  className="flex-1 px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors"
                >
                  {t('add')}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setNewItem({
                      title: '',
                      description: '',
                      price: '',
                      type: 'SERVICE',
                      imageUrl: ''
                    })
                    setImageFile(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-qilin-blue mb-4">{t('editItem')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('title')}
                </label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('title')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('description')}
                </label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder={t('description')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('price')}
                </label>
                <input
                  type="number"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('type')}
                </label>
                <select
                  value={editingItem.type}
                  onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="SERVICE">{t('service')}</option>
                  <option value="PRODUCT">{t('product')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('image')}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload-edit"
                  />
                  <label
                    htmlFor="image-upload-edit"
                    className="w-full px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors cursor-pointer text-center block"
                  >
                    {imageFile ? imageFile.name : (editingItem.imageUrl ? t('chooseImage') : t('chooseImage'))}
                  </label>
                </div>
                {uploading && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('loading')}</p>
                )}
                {imageFile && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    {t('success')}: {imageFile.name}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleEditItem}
                  className="flex-1 px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors"
                >
                  {t('save')}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingItem(null)
                    setImageFile(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
