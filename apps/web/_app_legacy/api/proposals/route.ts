import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  
  // 1. Authenticate User
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse Request Body
  const { campaign_id, pitch, proposed_rate } = await request.json();

  if (!campaign_id || !pitch || !proposed_rate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 3. Check if already applied
  const { data: existing } = await supabase
    .from('proposals')
    .select('id')
    .eq('campaign_id', campaign_id)
    .eq('influencer_id', user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'You have already applied to this campaign' }, { status: 409 });
  }

  // 4. Create Proposal
  const { data, error } = await supabase
    .from('proposals')
    .insert({
      campaign_id,
      influencer_id: user.id,
      pitch,
      proposed_rate,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, proposal: data });
}
