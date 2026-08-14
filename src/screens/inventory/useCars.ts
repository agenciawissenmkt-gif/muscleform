import { useCallback, useEffect, useState } from 'react'
import { CAR_PHOTOS_BUCKET, supabase } from '../../core/supabase'
import type { Car } from '../../core/types'

export interface CarDraft {
  brand: string
  model: string
  version: string | null
  year: number | null
  model_year: number | null
  color: string | null
  doors: number | null
  transmission: string | null
  body_type: string | null
  fuel: string | null
  mileage_km: number | null
  price_brl: number | null
  engine: string | null
  horsepower: number | null
  accepts_trade: boolean
  description: string | null
  status: Car['status']
}

/** Foto já salva no banco ou arquivo novo ainda não enviado. */
export type PhotoItem =
  | { kind: 'existing'; id: string; url: string; storage_path: string | null }
  | { kind: 'new'; id: string; url: string; file: File }

export function useCars(tenantId: string | undefined) {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    const { data, error: queryError } = await supabase
      .from('cars')
      .select('*, car_photos(*)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (queryError) {
      setError(queryError.message)
    } else {
      setError(null)
      setCars(
        (data as Car[]).map((car) => ({
          ...car,
          car_photos: [...(car.car_photos ?? [])].sort((a, b) => a.position - b.position),
        })),
      )
    }
    setLoading(false)
  }, [tenantId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  /** Cria ou atualiza o veículo e sincroniza as fotos (upload + remoções). */
  const saveCar = useCallback(
    async (draft: CarDraft, photos: PhotoItem[], carId?: string) => {
      if (!tenantId) throw new Error('Loja não identificada.')

      const { data: saved, error: saveError } = carId
        ? await supabase.from('cars').update(draft).eq('id', carId).select('id').single()
        : await supabase.from('cars').insert({ ...draft, tenant_id: tenantId }).select('id').single()

      if (saveError) throw saveError
      const id = (saved as { id: string }).id

      // Remove as fotos que o usuário tirou do anúncio
      if (carId) {
        const kept = new Set(photos.filter((p) => p.kind === 'existing').map((p) => p.id))
        const { data: current } = await supabase.from('car_photos').select('id,storage_path').eq('car_id', carId)
        const removed = (current ?? []).filter((p) => !kept.has(p.id as string))

        if (removed.length) {
          await supabase
            .from('car_photos')
            .delete()
            .in(
              'id',
              removed.map((p) => p.id as string),
            )
          const paths = removed.map((p) => p.storage_path as string | null).filter((p): p is string => Boolean(p))
          if (paths.length) await supabase.storage.from(CAR_PHOTOS_BUCKET).remove(paths)
        }
      }

      // Sobe as fotos novas e grava a ordem final
      const rows: { car_id: string; url: string; storage_path: string | null; position: number }[] = []

      for (const [index, photo] of photos.entries()) {
        if (photo.kind === 'existing') {
          await supabase.from('car_photos').update({ position: index }).eq('id', photo.id)
          continue
        }

        const extension = (photo.file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
        const path = `${tenantId}/${id}/${crypto.randomUUID()}.${extension || 'jpg'}`
        const { error: uploadError } = await supabase.storage
          .from(CAR_PHOTOS_BUCKET)
          .upload(path, photo.file, { contentType: photo.file.type || 'image/jpeg', upsert: false })

        if (uploadError) throw new Error(`Falha ao enviar a foto: ${uploadError.message}`)

        const { data: publicUrl } = supabase.storage.from(CAR_PHOTOS_BUCKET).getPublicUrl(path)
        rows.push({ car_id: id, url: publicUrl.publicUrl, storage_path: path, position: index })
      }

      if (rows.length) {
        const { error: photosError } = await supabase.from('car_photos').insert(rows)
        if (photosError) throw photosError
      }

      await refresh()
      return id
    },
    [tenantId, refresh],
  )

  const deleteCar = useCallback(
    async (car: Car) => {
      const paths = car.car_photos.map((p) => p.storage_path).filter((p): p is string => Boolean(p))
      const { error: deleteError } = await supabase.from('cars').delete().eq('id', car.id)
      if (deleteError) throw deleteError
      if (paths.length) await supabase.storage.from(CAR_PHOTOS_BUCKET).remove(paths)
      await refresh()
    },
    [refresh],
  )

  return { cars, loading, error, refresh, saveCar, deleteCar }
}
