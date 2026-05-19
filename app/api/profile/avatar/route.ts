import { getCloudinary } from "@/lib/cloudinary"
import { requireActiveUser } from "@/lib/auth-server"
import { NextRequest, NextResponse } from "next/server"

const MAX_AVATAR_SIZE = 2 * 1024 * 1024

export async function POST(request: NextRequest) {
  const context = await requireActiveUser()

  if (context.error || !context.user) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const formData = await request.formData()
  const file = formData.get("avatar")

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Choose an image to upload" },
      { status: 400 }
    )
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Avatar must be an image file" },
      { status: 400 }
    )
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return NextResponse.json(
      { error: "Image file size should be less than 2MB" },
      { status: 400 }
    )
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer())
    const dataUri = `data:${file.type};base64,${bytes.toString("base64")}`
    const cloudinary = getCloudinary()

    const upload = await cloudinary.uploader.upload(dataUri, {
      folder: "lch/profile-avatars",
      public_id: context.user.id,
      overwrite: true,
      resource_type: "image",
      transformation: [
        { width: 320, height: 320, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    })

    const { data, error } = await context.supabase
      .from("profiles")
      .update({ avatar_url: upload.secure_url })
      .eq("id", context.user.id)
      .select("id, full_name, email, phone, role, status, avatar_url, created_at, updated_at")
      .single()

    if (error) {
      return NextResponse.json(
        { error: "Avatar uploaded but profile could not be updated" },
        { status: 500 }
      )
    }

    await context.supabase.auth.updateUser({
      data: { avatar_url: upload.secure_url },
    })

    return NextResponse.json({
      avatarUrl: upload.secure_url,
      profile: data,
    })
  } catch (error) {
    console.error("Cloudinary avatar upload error:", error)
    return NextResponse.json(
      { error: "Unable to upload avatar" },
      { status: 500 }
    )
  }
}
