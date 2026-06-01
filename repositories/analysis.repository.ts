import { createClient } from '@/lib/supabase/server'

import type {
  CVAnalysis,
  CreateAnalysisDTO,
  UpdateAnalysisDTO,
} from '@/types/resume.types'

export class AnalysisRepository {

  async findById(id: string): Promise<CVAnalysis | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('cv_analyses')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null

    return data as CVAnalysis
  }

  async findByVersion(
    cvVersionId: string
  ): Promise<CVAnalysis[]> {

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('cv_analyses')
      .select('*')
      .eq('cv_version_id', cvVersionId)
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return data as CVAnalysis[]
  }

  async findLatestByVersion(
    cvVersionId: string
  ): Promise<CVAnalysis | null> {

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('cv_analyses')
      .select('*')
      .eq('cv_version_id', cvVersionId)
      .eq('processing_status', 'complete')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null

    return data as CVAnalysis
  }

  async findLatestByUser(
    userId: string
  ): Promise<CVAnalysis | null> {

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('cv_analyses')
      .select('*')
      .eq('user_id', userId)
      .eq('processing_status', 'complete')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null

    return data as CVAnalysis
  }

  async getByUser(
    userId: string
  ): Promise<CVAnalysis[]> {

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('cv_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return data as CVAnalysis[]
  }

  async create(
    dto: CreateAnalysisDTO
  ): Promise<CVAnalysis> {

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('cv_analyses')
      .insert({
        ...dto,
        processing_status:
          dto.processing_status ?? 'pending',
      })
      .select()
      .single()

    if (error || !data) {
      throw new Error(
        `Failed to create analysis: ${error?.message}`
      )
    }

    return data as CVAnalysis
  }

  async update(
    id: string,
    dto: UpdateAnalysisDTO
  ): Promise<CVAnalysis> {

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('cv_analyses')
      .update(dto)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      throw new Error(
        `Failed to update analysis: ${error?.message}`
      )
    }

    return data as CVAnalysis
  }

  async updateStatus(
    id: string,
    status: CVAnalysis['processing_status']
  ): Promise<void> {

    const supabase = await createClient()

    const { error } = await supabase
      .from('cv_analyses')
      .update({
        processing_status: status,
      })
      .eq('id', id)

    if (error) {
      throw new Error(
        `Failed to update analysis status: ${error.message}`
      )
    }
  }

  async countByUser(
    userId: string
  ): Promise<number> {

    const supabase = await createClient()

    const { count } = await supabase
      .from('cv_analyses')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('user_id', userId)

    return count ?? 0
  }

  // ── Best ATS score across all analyses ───────────────────────

  async getBestScore(
    userId: string
  ): Promise<number | null> {

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('cv_analyses')
      .select('ats_score')
      .eq('user_id', userId)
      .eq('processing_status', 'complete')
      .order('ats_score', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null

    return data.ats_score
  }
}

export const analysisRepository =
  new AnalysisRepository()