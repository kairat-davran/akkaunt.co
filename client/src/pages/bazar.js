import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getItems,
  createItem,
  updateItem,
  saveItem,
  unsaveItem,
  getSavedItems
} from '../redux/actions/bazarAction'
import ItemCard from '../components/bazar/ItemCard'
import CategoryFilter from '../components/bazar/CategoryFilter'
import SearchBar from '../components/bazar/SearchBar'
import imageCompression from 'browser-image-compression'
import { GLOBALTYPES } from '../redux/actions/globalTypes'
import { useTranslation } from 'react-i18next'

const BazarScreen = () => {
  const dispatch = useDispatch()
  const { items, loading, saved } = useSelector(state => state.bazar)
  const auth = useSelector(state => state.auth)
  const { t } = useTranslation()

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchKeyword, setSearchKeyword] = useState('')

  const initialItemState = {
    title: '',
    price: '',
    description: '',
    location: '',
    category: ''
  }

  const [itemData, setItemData] = useState(initialItemState)
  const [images, setImages] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    if (auth.token) {
      dispatch(getItems(auth.token, searchKeyword, selectedCategory))
      dispatch(getSavedItems(auth.token))
    }
  }, [dispatch, auth.token, searchKeyword, selectedCategory])

  const handleChange = e => {
    setItemData({ ...itemData, [e.target.name]: e.target.value })
  }

  const handleImageChange = async (e) => {
    const files = [...e.target.files]
    let compressedImages = []

    for (const file of files) {
      if (!file) continue
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        })
        compressedImages.push(compressed)
      } catch (err) {
        dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { error: "Image compression failed." }
        })
      }
    }

    setImages(prev => [...prev, ...compressedImages])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!itemData.title || !itemData.price || !itemData.location) {
      return dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: t('required_fields') }
      })
    }

    let success
    if (editingId) {
      success = await dispatch(updateItem({ id: editingId, data: itemData, images, auth }))
    } else {
      success = await dispatch(createItem({ data: itemData, images, auth }))
    }

    if (success) {
      setModalVisible(false)
      setItemData(initialItemState)
      setImages([])
      setEditingId(null)
    }
  }

  const handleEdit = (item) => {
    setItemData({
      title: item.title,
      price: item.price,
      description: item.description,
      location: item.location,
      category: item.category
    })
    setImages(item.images || [])
    setEditingId(item._id)
    setModalVisible(true)
  }

  return (
    <div className="bazar-screen px-md-4 px-2 py-5">
      <div className="bazar-header d-flex flex-row justify-content-between align-items-center mb-4 flex-wrap">
        <h3 className="text-capitalize fw-semibold mb-2 mb-md-0">{t('bazar_title')}</h3>

        <div className="d-flex align-items-center gap-2">
          {auth.token && (
            <button className="btn btn-primary d-flex align-items-center" onClick={() => setModalVisible(true)}>
              <span className="material-icons me-1">add_circle</span> {t('add_item')}
            </button>
          )}

          <img
            src={auth.user.avatar}
            alt={auth.user.username}
            title={auth.user.username}
            className="bazar-avatar"
          />
        </div>
      </div>

      <div className="bazar-filters mb-4">
        <SearchBar search={searchKeyword} setSearch={setSearchKeyword} />
        <CategoryFilter selected={selectedCategory} setSelected={setSelectedCategory} />
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted text-center mt-4">{t('no_items_found')}</p>
      ) : (
        <div className="row">
          {items.map(item => {
            const isOwner = item.seller?._id === auth.user?._id
            const isSaved = saved.some(i => i._id === item._id)

            return (
              <div className="col-6 col-md-4 col-lg-3 mb-4" key={item._id}>
                <ItemCard
                  item={item}
                  isOwner={isOwner}
                  isSaved={isSaved}
                  onEdit={() => handleEdit(item)}
                  onToggleSave={() =>
                    isSaved
                      ? dispatch(unsaveItem(item, auth))
                      : dispatch(saveItem(item, auth))
                  }
                />
              </div>
            )
          })}
        </div>
      )}

      {modalVisible && (
        <div className="modal-backdrop">
          <div className="modal-content p-4 rounded shadow">
            <h5>{editingId ? t('edit_item') : t('create_item')}</h5>

            <input name="title" className="form-control my-2" placeholder={t('title')} value={itemData.title} onChange={handleChange} />
            <input name="price" className="form-control my-2" placeholder={t('price')} type="number" value={itemData.price} onChange={handleChange} />
            <textarea name="description" className="form-control my-2" placeholder={t('description')} rows="3" value={itemData.description} onChange={handleChange} />
            <input name="location" className="form-control my-2" placeholder={t('location')} value={itemData.location} onChange={handleChange} />

            <select name="category" className="form-select my-2" value={itemData.category} onChange={handleChange}>
              <option value="">{t('select_category')}</option>
              <option value="foods">{t('category_foods')}</option>
              <option value="services">{t('category_services')}</option>
              <option value="vehicles">{t('category_vehicles')}</option>
              <option value="furniture">{t('category_furniture')}</option>
              <option value="electronics">{t('category_electronics')}</option>
              <option value="etc">{t('category_etc')}</option>
            </select>

            <label className="form-label mt-3">{t('images')}</label>
            <div className="custom-file-upload mt-2">
              <label htmlFor="event-images" className="btn">
                <span className="material-icons me-1">upload</span> {t('choose_images')}
              </label>
              <input
                type="file"
                id="event-images"
                name="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
            </div>

            <div className="d-flex flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="m-2 position-relative">
                  <img
                    src={img.url ? img.url : URL.createObjectURL(img)}
                    className="img-thumbnail"
                    style={{ width: 100, height: 100, objectFit: 'cover' }}
                    alt="preview"
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0"
                    onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-end mt-3">
              <button
                className="btn btn-secondary me-2"
                onClick={() => {
                  setModalVisible(false)
                  setItemData(initialItemState)
                  setImages([])
                  setEditingId(null)
                }}
              >
                {t('cancel')}
              </button>
              <button className="btn btn-success" onClick={handleSubmit}>
                {editingId ? t('update') : t('post')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BazarScreen