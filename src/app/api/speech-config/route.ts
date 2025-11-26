import { NextResponse } from 'next/server';

/**
 * GET /api/speech-config
 * 
 * 브라우저에서 사용할 Speech Service 설정을 반환합니다.
 * 보안상 프로덕션에서는 더 안전한 방법을 사용해야 합니다.
 */
export async function GET() {
  const speechKey = process.env.SPEECH_KEY;
  const speechRegion = process.env.SPEECH_REGION;

  if (!speechKey || !speechRegion) {
    return NextResponse.json(
      { error: 'Speech service not configured' },
      { status: 500 }
    );
  }

  // PoC 목적이므로 키를 직접 반환
  // 프로덕션에서는 더 안전한 방법 사용 권장
  return NextResponse.json({
    key: speechKey,
    region: speechRegion,
  });
}

