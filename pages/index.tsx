import Head from "next/head"
import { useEffect, useRef, useState } from "react"
import style from "./index.module.scss"
import { v4 as uuid } from "uuid"

export const config = {
  api: {
    bodyParser: false,
  },
};

type FileImageSet = {
  id: string
  file: File
  image: HTMLImageElement
}

export default function Home() {
  const [fileSets, setFiles] = useState<FileImageSet[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = 1000
      canvasRef.current.height = 1000
    }
  }, [canvasRef.current])

  const onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.currentTarget.files
    if (!fileList) {
      throw new Error("FileList is null")
    }
    const newFiles: FileImageSet[] = []
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i)!
      await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          img.src = reader.result as string
          img.onload = () => {
            resolve(img)
            newFiles.push({
              id: uuid(),
              file,
              image: img
            })
          }
        }
      })
    }
    setFiles([...fileSets, ...newFiles])
  }
  useEffect(() => {
    updateCanvas()
  }, [fileSets])
  const updateCanvas = async () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        fileSets.forEach((fileImageSet) => {
          const img = fileImageSet.image
          const { width, height } = img
          const cropLength = width > height ? height : width
          ctx.drawImage(
            img,
            (width - cropLength) / 2,
            (height - cropLength) / 2,
            cropLength,
            cropLength,
            0,
            0,
            1000,
            1000
          ) 
        })
      }
    }
  }
  const onAddClick = () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }
  const onRemoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const index = Number(e.currentTarget.dataset.index)
    const newFileSets = fileSets.filter((_, i) => i !== index)
    setFiles(newFileSets)
  }
  const onUpClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const index = Number(e.currentTarget.dataset.index)
    if (index === 0) {
      return
    }
    const tmp = fileSets[index]
    fileSets[index] = fileSets[index - 1]
    fileSets[index - 1] = tmp
    setFiles([...fileSets])
  }
  const onDownClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const index = Number(e.currentTarget.dataset.index)
    if (index === fileSets.length - 1) {
      return
    }
    const tmp = fileSets[index]
    fileSets[index] = fileSets[index + 1]
    fileSets[index + 1] = tmp
    setFiles([...fileSets])
  }
  return (
    <>
      <Head>
      </Head>
      <main>
        <button
          onClick={onAddClick}
        >Add file</button>
        <input
          className={style.fileInput}
          type="file"
          onChange={onInputChange}
          ref={inputRef}
          multiple
        />
        <canvas ref={canvasRef} className={style.preview} />
        <div className={style.imageList}>
          {fileSets.map((fileImageSet, i) => {
            return (
              <div key={fileImageSet.id} className={style.row}>
                <img src={fileImageSet.image.src} alt=""/>
                <button data-index={i} onClick={onUpClick}>Up</button>
                <button data-index={i} onClick={onDownClick}>Down</button>
                <button data-index={i} onClick={onRemoveClick}>Remove</button>
              </div>
            )
          })}
        </div>
      </main>
    </>
  )
}
