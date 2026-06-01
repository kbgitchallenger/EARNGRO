import { createClient } from '@/lib/supabase/server'
import type {
  CVVersion,
  CVParseJob,
  CreateCVVersionDTO,
  UpdateCVVersionDTO,
  ScoreHistoryPoint,
} from '@/types/resume.types'

export class ResumeRepository {

  // ── cv_versions ───────────────────────────────────────────────

  async findById(id: string): Promise<CVVersion | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cv_versions')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return data as CVVersion
  }

  async findByUser(userId: string): Promise<CVVersion[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cv_versions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data as CVVersion[]
  }

  async findPrimary(userId: string): Promise<CVVersion | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cv_versions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .single()

    if (error || !data) return null
    return data as CVVersion
  }

  async getLatestVersionNumber(userId: string): Promise<number> {
    const supabase = await createClient()
    const { data } = await supabase
      .from('cv_versions')
      .select('version_number')
      .eq('user_id', userId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single()

    return data?.version_number ?? 0
  }

  async create(dto: CreateCVVersionDTO): Promise<CVVersion> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cv_versions')
      .insert(dto)
      .select()
      .single()

    if (error || !data) throw new Error(`Failed to create CV version: ${error?.message}`)
    return data as CVVersion
  }

  async update(id: string, dto: UpdateCVVersionDTO): Promise<CVVersion> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cv_versions')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) throw new Error(`Failed to update CV version: ${error?.message}`)
    return data as CVVersion
  }

  async setAsPrimary(userId: string, versionId: string): Promise<void> {
    const supabase = await createClient()

    // Unset all primaries for user first
    await supabase
      .from('cv_versions')
      .update({ is_primary: false })
      .eq('user_id', userId)

    // Set the target as primary
    const { error } = await supabase
      .from('cv_versions')
      .update({ is_primary: true })
      .eq('id', versionId)
      .eq('user_id', userId)

    if (error) throw new Error(`Failed to set primary: ${error.message}`)
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('cv_versions')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete CV version: ${error.message}`)
  }

  async countByUser(userId: string): Promise<number> {
    const supabase = await createClient()
    const { count, error } = await supabase
      .from('cv_versions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    return count ?? 0
  }

  // ── cv_parse_jobs ────────────────────────────────────────────

  async createParseJob(
    cvVersionId: string,
    userId: string
  ): Promise<CVParseJob> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cv_parse_jobs')
      .insert({
        cv_version_id: cvVersionId,
        user_id: userId,
        status: 'queued',
      })
      .select()
      .single()

    if (error || !data) throw new Error(`Failed to create parse job: ${error?.message}`)
    return data as CVParseJob
  }

  async updateParseJob(
    jobId: string,
    updates: Partial<Pick<CVParseJob, 'status' | 'parse_method' | 'error_message' | 'started_at' | 'completed_at'>>
  ): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('cv_parse_jobs')
      .update(updates)
      .eq('id', jobId)

    if (error) throw new Error(`Failed to update parse job: ${error.message}`)
  }

  async getParseJobByVersion(cvVersionId: string): Promise<CVParseJob | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cv_parse_jobs')
      .select('*')
      .eq('cv_version_id', cvVersionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null
    return data as CVParseJob
  }

  // ── Score history (for charts) ────────────────────────────────

  async getScoreHistory(userId: string): Promise<ScoreHistoryPoint[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cv_analyses')
      .select(`
        created_at,
        ats_score,
        recruiter_score,
        market_alignment,
        cv_versions!inner(version_number, name, user_id)
      `)
      .eq('user_id', userId)
      .eq('processing_status', 'complete')
      .order('created_at', { ascending: true })

    if (error || !data) return []

    return data.map((row: any) => ({
      date: row.created_at,
      version_number: row.cv_versions?.version_number ?? 0,
      version_name: row.cv_versions?.name ?? null,
      ats_score: row.ats_score ?? 0,
      recruiter_score: row.recruiter_score ?? 0,
      market_alignment: row.market_alignment ?? 0,
    }))
  }
}

// Singleton export — import this in services, never instantiate directly in routes
export const resumeRepository = new ResumeRepository()