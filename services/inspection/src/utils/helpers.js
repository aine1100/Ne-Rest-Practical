const EXT_SERVICE = `http://localhost:${process.env.EXTINGUISHER_SERVICE_PORT || 3002}`;

export async function updateExtinguisherStatus(extinguisherId, status, userId) {
  try {
    const res = await fetch(`${EXT_SERVICE}/extinguishers/${extinguisherId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': String(userId),
        'x-user-role': 'admin',
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      console.error(`Failed to update extinguisher status: ${res.status}`);
    }
  } catch (err) {
    console.error('Cross-service call failed:', err.message);
  }
}

export async function notifyService(payload) {
  const NOTIF_SERVICE = `http://localhost:${process.env.NOTIFICATION_SERVICE_PORT || 3005}`;
  try {
    await fetch(`${NOTIF_SERVICE}/notifications/internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Notification call failed:', err.message);
  }
}
