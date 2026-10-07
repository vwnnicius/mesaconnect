import { NextRequest, NextResponse } from 'next/server';
import { processDeviceEvent } from '@/services/deviceService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { device_uid, event_type, timestamp, payload } = body;

    if (!device_uid || !event_type) {
      return NextResponse.json(
        { error: 'device_uid e event_type são campos obrigatórios' },
        { status: 400 }
      );
    }

    const result = await processDeviceEvent({
      device_uid,
      event_type,
      timestamp,
      payload,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 403 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Erro na API /api/device/events:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao processar evento de dispositivo' },
      { status: 500 }
    );
  }
}
