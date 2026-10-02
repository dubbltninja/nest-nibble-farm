# Updating photos and availability

Photos and each breed's availability are edited at **https://app.pagescms.org** (Pages CMS), from a phone or computer. Saving there commits to this repository, and the site republishes a minute or two later.

## One-time setup

1. Open https://app.pagescms.org and choose **Sign in with GitHub**.
2. When asked, install the Pages CMS GitHub App on the `dubbltninja` account and give it access to the `nest-nibble-farm` repository only.
3. Open `nest-nibble-farm` in Pages CMS and pick the branch to edit. While the redesign is unmerged that is `claude-redesign`; after it is merged, use `main`.
4. To let someone edit without a GitHub account, invite them by email from the repository's Collaborators screen in Pages CMS.

## Changing a photo

1. Open **Photos and availability**.
2. Tap the breed (or "Home page main photo" / "About page photo").
3. Tap the photo field, upload from your camera roll or pick one already uploaded, then **Save**.

Landscape photos work best: breed photos are shown in a wide frame and cropped from the centre.

## Changing availability

Open the breed, choose a value under **Availability**, and save. The label and the button text on the site follow it.

## How it works

- Uploaded files go to `assets/photos/`. The paths are recorded in `data/farm.json`.
- A breed with no uploaded photo still shows its old Cloudinary photo, so photos can be moved over one at a time.
- `.github/workflows/resize-photos.yml` shrinks each upload to 2000px on its long side and strips its metadata, including GPS location.
- `.pages.yml` defines the editing screen.

## Limits

- The breed list, names and descriptions are still written in the page files. Adding a row in Pages CMS does not add a breed to the site.
- The fields marked "do not change" tie each entry to its place on the site.
- This repository is public. The first copy of an upload, before it is resized, stays in the repository history with whatever location data the phone attached.
