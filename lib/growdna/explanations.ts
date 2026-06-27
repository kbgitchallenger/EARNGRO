// Pre-written, static explanations mapped to real answer values.
// Zero AI tokens — pure lookup. Written once, reused for every user.
// Each entry explains WHY an answer affects a dimension, in plain
// language — without revealing exact point values or weight %.

export interface AnswerExplanation {
  dimension: keyof DimensionKey
  text: string
}

type DimensionKey = {
  market_alignment: true
  skill_premium: true
  visibility: true
  mobility: true
  negotiation: true
}

// Key format: "questionId.optionValue"
export const ANSWER_EXPLANATIONS: Record<string, AnswerExplanation> = {

  // ── Market Alignment — industry ──────────────────────────────
  'industry.tech_product':   { dimension: 'market_alignment', text: 'Tech product/SaaS is one of the highest-paying segments right now — this lifts your market alignment.' },
  'industry.tech_services':  { dimension: 'market_alignment', text: 'IT services pays solidly but typically below product companies for the same role.' },
  'industry.startup_vc':     { dimension: 'market_alignment', text: 'VC-backed startups often pay competitively to attract talent — a positive signal here.' },
  'industry.govt_psu':       { dimension: 'market_alignment', text: 'Government/PSU roles trade market-rate pay for stability — this brings your market alignment down.' },
  'industry.nonprofit':      { dimension: 'market_alignment', text: 'Non-profit compensation is typically well below market rate for equivalent skills.' },
  'industry.manufacturing':  { dimension: 'market_alignment', text: 'Manufacturing pay varies widely by company — this is a moderate signal.' },

  // ── Market Alignment — city ───────────────────────────────────
  'city.bengaluru':   { dimension: 'market_alignment', text: 'Bengaluru is India\'s highest-paying tech market — this strengthens your market alignment.' },
  'city.singapore':   { dimension: 'market_alignment', text: 'Singapore commands SEA\'s premium salary band — a strong positive signal.' },
  'city.tier2_india': { dimension: 'market_alignment', text: 'Tier 2 cities typically pay 20-35% below metro rates for the same role — this lowers your market alignment.' },
  'city.remote':      { dimension: 'market_alignment', text: 'Remote-first roles often pay closer to top-market rates regardless of your location.' },

  // ── Skill Premium — internship/experience quality (fresher) ──
  'internship_quality.mnc_internship':   { dimension: 'skill_premium', text: 'An MNC internship is a strong early credibility signal — this lifts your skill premium.' },
  'internship_quality.startup_intern':   { dimension: 'skill_premium', text: 'Startup internships show initiative and hands-on exposure — a solid contributor.' },
  'internship_quality.none':             { dimension: 'skill_premium', text: 'No internship or project experience listed — this is the biggest lever you can pull right now.' },

  // ── Skill Premium — certifications ────────────────────────────
  'certifications_fresher.cloud_cert':  { dimension: 'skill_premium', text: 'A cloud certification (AWS/GCP/Azure) is a high-value, recruiter-recognised signal.' },
  'certifications_fresher.none_cert':   { dimension: 'skill_premium', text: 'No certifications yet — even one recognised cert noticeably moves this dimension.' },

  // ── Skill Premium — premium skills (mid) ──────────────────────
  'premium_skills.ai_ml':           { dimension: 'skill_premium', text: 'AI/ML/LLM skills are currently the single highest-demand premium skill in the market.' },
  'premium_skills.cloud_arch':      { dimension: 'skill_premium', text: 'Cloud architecture expertise is consistently rewarded at a premium across industries.' },
  'premium_skills.no_premium':      { dimension: 'skill_premium', text: 'You didn\'t select any premium skill — this is the fastest dimension to improve with focused upskilling.' },

  // ── Visibility — external presence (senior) ───────────────────
  'external_visibility.speaker':         { dimension: 'visibility', text: 'Conference speaking is one of the strongest visibility signals recruiters look for at senior levels.' },
  'external_visibility.linkedin_active': { dimension: 'visibility', text: 'An active LinkedIn presence with a real following meaningfully raises your external visibility.' },
  'external_visibility.no_visibility':   { dimension: 'visibility', text: 'You told us you keep a low public profile — this is the dimension where senior professionals most often leave money on the table.' },

  // ── Mobility — promotion velocity (mid) ────────────────────────
  'promotion_velocity.fast_track': { dimension: 'mobility', text: 'Being promoted faster than peers is one of the strongest predictors of continued high earning trajectory.' },
  'promotion_velocity.switched':   { dimension: 'mobility', text: 'Growing through company switches is a valid, often faster path to higher pay than waiting for internal promotion.' },
  'promotion_velocity.on_track':   { dimension: 'mobility', text: 'On-track progression is healthy, but it\'s the median — not what separates top earners.' },
  'promotion_velocity.slow':       { dimension: 'mobility', text: 'Slower-than-peer progression is actively widening your gap the longer it continues.' },
  'promotion_velocity.stuck':      { dimension: 'mobility', text: 'Four or more years in the same role is what we call a tenure trap — the market has likely moved ahead of your current pay.' },

  // ── Negotiation — universal, everyone answers this ────────────
  'negotiation_history.never':        { dimension: 'negotiation', text: 'You told us you\'ve never negotiated your salary. This is the single most controllable gap driver — non-negotiators typically earn 12-18% less than identical peers who do.' },
  'negotiation_history.joining_only': { dimension: 'negotiation', text: 'Negotiating only at joining means you\'re likely leaving money on the table at every review cycle since.' },
  'negotiation_history.few_years':    { dimension: 'negotiation', text: 'It\'s been a couple of years since you last negotiated — the gap has likely widened since then.' },
  'negotiation_history.last_year':    { dimension: 'negotiation', text: 'Negotiating within the last year is a healthy habit forming — keep it consistent.' },
  'negotiation_history.recently':     { dimension: 'negotiation', text: 'Negotiating in the last 6 months puts you among active market participants — a real positive signal.' },
  'negotiation_history.regularly':    { dimension: 'negotiation', text: 'Negotiating every review cycle is top-5% behaviour — this is actively protecting your market value.' },

  // ── Sales & Field — quota/deal/revenue signals (mapped to mobility) ──
  'quota_attainment.exceed_consistently': { dimension: 'mobility', text: 'Consistently exceeding quota by 110%+ puts you in the top quartile of sales performers — this strongly lifts your market mobility.' },
  'quota_attainment.below_target':        { dimension: 'mobility', text: 'Below-target attainment is the fastest-moving lever in sales comp — even one strong quarter materially shifts this.' },
  'revenue_ownership.team_25cr_plus':     { dimension: 'mobility', text: 'Owning a ₹25Cr+ team revenue number places you in senior sales leadership compensation territory.' },
  'sales_team_scale.national_head':       { dimension: 'mobility', text: 'Leading a 25+ rep national/zonal team is a director-equivalent scope in sales organisations.' },

// ── Operations & Industrial — mapped to mobility and skill_premium ──
  'ops_scale_managed.multi_site':         { dimension: 'mobility', text: 'Managing multiple sites or locations is a regional-scope signal that typically commands a higher band than single-site roles.' },
  'cost_impact.major_savings':            { dimension: 'skill_premium', text: 'A major, quantified cost reduction (₹50L+ or 20%+ efficiency) is exactly the kind of measurable impact that moves operations compensation.' },
  'cost_impact.no_clear_impact':          { dimension: 'skill_premium', text: 'No clearly quantified impact yet — this is the fastest lever to pull, since even one measured improvement noticeably strengthens your profile.' },
  'ops_team_scale.regional_ops_head':     { dimension: 'mobility', text: 'Leading a regional or national operations team of 1000+ places you in senior operations leadership territory.' },
  'capex_budget_ownership.capex_25cr_plus': { dimension: 'mobility', text: 'Owning ₹25Cr+ in budget or capital expenditure is the operations-track equivalent of P&L ownership in corporate roles — a strong senior-level signal.' },

  // ── Healthcare — mapped to market_alignment and skill_premium ──
  'clinical_practice_setting.corporate_hospital': { dimension: 'market_alignment', text: 'Corporate hospital chains pay significantly above government and smaller private setups for the same specialisation.' },
  'specialization_tier.super_specialist':         { dimension: 'skill_premium', text: 'Super-specialisations like cardiology and oncology command the highest premiums in healthcare due to scarcity.' },
  'department_leadership.medical_director':       { dimension: 'mobility', text: 'A Medical Director or CMO role represents the senior leadership ceiling in clinical healthcare careers.' },

  // ── Public Service — mapped to mobility and visibility ──
  'grade_pay_level.fast_track_exam':    { dimension: 'mobility', text: 'Fast-tracking via a competitive exam is the public-service equivalent of being promoted faster than peers.' },
  'senior_admin_scope.national_secretariat': { dimension: 'mobility', text: 'A ministry-level secretariat posting is the highest administrative scope achievable in civil services.' },
  'policy_influence.national_policy':   { dimension: 'visibility', text: 'Shaping national policy is a strong visibility and influence signal, relevant well beyond your current role.' },

  // ── Marketing — mapped to skill_premium and mobility ──
  'marketing_specialization.performance_growth': { dimension: 'skill_premium', text: 'Performance/growth marketing currently commands the highest premium in marketing due to direct, measurable revenue attribution.' },
  'marketing_specialization.brand_marketing':     { dimension: 'skill_premium', text: 'Brand marketing is valued but typically commands a more moderate premium than performance-driven specialisations, since impact is harder to attribute directly.' },
  'marketing_leadership_scope.cmo_equivalent':    { dimension: 'mobility', text: 'A CMO or Head of Marketing role represents the senior leadership ceiling in marketing careers.' },

  // ── Finance — mapped to skill_premium and mobility ──
  'finance_specialization.ib_corp_finance':       { dimension: 'skill_premium', text: 'Investment banking and corporate finance roles command the highest premiums within the finance function.' },
  'finance_certifications.none_finance_cert':     { dimension: 'skill_premium', text: 'No formal finance certification yet — a CA, CFA, or FRM is one of the fastest ways to materially shift this dimension.' },
  'finance_leadership_scope.cfo_equivalent':       { dimension: 'mobility', text: 'A CFO or Finance Head role represents the senior leadership ceiling in finance careers.' },

  // ── HR — mapped to skill_premium and mobility ──
  'hr_specialization.comp_benefits':              { dimension: 'skill_premium', text: 'Compensation & Benefits is typically the highest-paying specialisation within HR due to its direct link to overall organisational pay strategy.' },
  'hr_leadership_scope.chro_equivalent':           { dimension: 'mobility', text: 'A CHRO or Head of HR role represents the senior leadership ceiling in HR careers.' },

  // ── Design — mapped to skill_premium and mobility ──
  'design_portfolio_evidence.strong_portfolio_metrics': { dimension: 'skill_premium', text: 'A portfolio with measured impact (conversion, engagement, etc.) is the single strongest signal design recruiters screen for.' },
  'design_portfolio_evidence.early_career_design': { dimension: 'skill_premium', text: 'Still building your portfolio — this is the fastest lever to pull, since even 1-2 strong case studies with measurable outcomes shift this meaningfully.' },
  'design_leadership_scope.head_of_design':       { dimension: 'mobility', text: 'A Head of Design or VP Design role represents the senior leadership ceiling in design careers.' },

  // ── Consulting — mapped to skill_premium and mobility ──
  'consulting_context.mbb_strategy':              { dimension: 'skill_premium', text: 'Strategy consulting at a top-tier (MBB-equivalent) firm commands the highest premium in the consulting market.' },
  'consulting_leadership_scope.partner_principal': { dimension: 'mobility', text: 'Reaching Partner or Principal represents the senior leadership ceiling in consulting careers.' },

}


// Mobility also derives from seniority for freshers/juniors with no
// promotion_velocity question — handled separately in getExplanations()
export const SENIORITY_MOBILITY_NOTE: Record<string, string> = {
  fresher: 'As a fresher, your career mobility score is based on standard early-career trajectory — this will sharpen with your first few moves.',
  junior:  'As an early-career professional, your mobility score reflects typical trajectory at this stage — it becomes more personalised as you progress.',
}