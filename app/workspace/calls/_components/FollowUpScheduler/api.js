export const savePreset = async ({ organisationId, title, objectives, user }) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/follow_ups/save_preset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await user.getIdToken()}`
      },
      body: JSON.stringify({
        organisationId,
        title,
        objectives,
      }),
    });

    const data = await response.json();
    if (data.message === "success") {
      return { success: true, presetId: data.presetId };
    }
    return { success: false };
  } catch (error) {
    return { success: false, error };
  }
};

export const editPreset = async ({ organisationId, presetId, title, objectives, user }) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/follow_ups/update_presets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await user.getIdToken()}`
      },
      body: JSON.stringify({
        organisationId,
        presetId,
        title,
        objectives,
      }),
    });

    const data = await response.json();
    return { success: data.message === "success" };
  } catch (error) {
    return { success: false, error };
  }
};

export const deletePreset = async ({ organisationId, presetId, user }) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/delete_follow_up_preset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await user.getIdToken()}`
      },
      body: JSON.stringify({
        organisationId,
        presetId,
      }),
    });

    const data = await response.json();
    return { success: data.message === "success" };
  } catch (error) {
    return { success: false, error };
  }
};

export const scheduleCall = async ({ organisationId, patients, objectives, scheduledFor, templateTitle, user }) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/follow_ups/schedule_call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await user.getIdToken()}`
      },
      body: JSON.stringify({
        organisationId,
        patients,
        objectives,
        scheduledFor,
        templateTitle
      }),
    });

    const data = await response.json();
    return { success: response.ok };
  } catch (error) {
    return { success: false, error };
  }
}; 