import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { GLOBALTYPES } from '../redux/actions/globalTypes'
import { createPost, updatePost } from '../redux/actions/postAction'
import imageCompression from 'browser-image-compression'
import Icons from './Icons'
import { imageShow } from '../utils/mediaShow'
import { useTranslation } from 'react-i18next'

const StatusModal = () => {
  const { t } = useTranslation()
  const auth = useSelector(state => state.auth)
  const status = useSelector(state => state.status)
  const socket = useSelector(state => state.communication.socket)
  const dispatch = useDispatch()

  const [content, setContent] = useState('')
  const [images, setImages] = useState([])

  const [stream, setStream] = useState(false)
  const videoRef = useRef()
  const refCanvas = useRef()
  const [tracks, setTracks] = useState('')

  const handleChangeImages = async (e) => {
    const files = [...e.target.files]
    let newImages = []

    for (const file of files) {
      if (!file) {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { error: t('error.no_file') } })
        continue
      }

      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        })
        newImages.push(compressedFile)
      } catch (err) {
        dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { error: t('error.image_compression') }
        })
      }
    }

    setImages(prev => [...prev, ...newImages])
  }

  const deleteImages = (index) => {
    const newArr = [...images]
    newArr.splice(index, 1)
    setImages(newArr)
  }

  const handleStream = () => {
    setStream(true)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(mediaStream => {
          videoRef.current.srcObject = mediaStream
          videoRef.current.play()
          const track = mediaStream.getTracks()
          setTracks(track[0])
        }).catch(err => console.log(err))
    }
  }

  const handleCapture = () => {
    const width = videoRef.current.clientWidth;
    const height = videoRef.current.clientHeight;

    refCanvas.current.setAttribute("width", width);
    refCanvas.current.setAttribute("height", height);

    const ctx = refCanvas.current.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, width, height);

    refCanvas.current.toBlob(async (blob) => {
      const file = new File([blob], `photo_${Date.now()}.jpg`, {
        type: 'image/jpeg'
      })

      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        })

        setImages((prev) => [...prev, compressedFile])
      } catch (err) {
        dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { error: t('error.image_compression') }
        })
      }
    }, 'image/jpeg')
  }

  const handleStopStream = () => {
    tracks.stop()
    setStream(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (images.length === 0)
      return dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: t('error.no_photo') }
      })

    if (status.onEdit) {
      dispatch(updatePost({ content, images, auth, status }))
    } else {
      dispatch(createPost({ content, images, auth, socket }))
    }

    setContent('')
    setImages([])
    if (tracks) tracks.stop()
    dispatch({ type: GLOBALTYPES.STATUS, payload: false })
  }

  useEffect(() => {
    if (status.onEdit) {
      setContent(status.content)
      setImages(status.images)
    }
  }, [status])

  return (
    <div className="status_modal">
      <form onSubmit={handleSubmit}>
        <div className="status_header">
          <h5 className="m-0">{t('create_post')}</h5>
          <span onClick={() => dispatch({ type: GLOBALTYPES.STATUS, payload: false })}>&times;</span>
        </div>

        <div className="status_body">
          <textarea
            name="content"
            value={content}
            placeholder={t('thinking_placeholder', { username: auth.user.username })}
            onChange={e => setContent(e.target.value)}
          />

          <div className="d-flex">
            <div className="flex-fill"></div>
            <Icons setContent={setContent} content={content} />
          </div>

          <div className="show_images">
            {images.map((img, index) => (
              <div key={index} id="file_img">
                {img.camera
                  ? imageShow(img.camera)
                  : img.url
                    ? imageShow(img.url)
                    : imageShow(URL.createObjectURL(img))
                }
                <span onClick={() => deleteImages(index)}>&times;</span>
              </div>
            ))}
          </div>

          {stream && (
            <div className="stream position-relative">
              <video autoPlay muted ref={videoRef} width="100%" height="100%" />
              <span onClick={handleStopStream}>&times;</span>
              <canvas ref={refCanvas} style={{ display: 'none' }} />
            </div>
          )}

          <div className="input_images">
            {stream ? (
              <span
                className="material-icons"
                onClick={handleCapture}
                title={t('capture_photo')}
              >
                photo_camera
              </span>
            ) : (
              <>
                <span
                  className="material-icons"
                  onClick={handleStream}
                  title={t('open_camera')}
                >
                  photo_camera
                </span>
                <div className="file_upload">
                  <span className="material-icons" title={t('upload_image')}>image</span>
                  <input
                    type="file"
                    name="file"
                    id="file"
                    multiple
                    accept="image/*"
                    onChange={handleChangeImages}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="status_footer">
          <button className="btn btn-success w-100" type="submit">
            {status.onEdit ? t('update') : t('post')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default StatusModal