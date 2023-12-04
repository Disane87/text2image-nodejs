![GitHub](https://img.shields.io/github/license/Disane87/text2image-nodejs)
![GitHub issues by-label](https://img.shields.io/github/issues/Disane87/text2image-nodejs/bug?color=red)
![GitHub contributors](https://img.shields.io/github/contributors/Disane87/text2image-nodejs)
![Docker Stars](https://img.shields.io/docker/stars/disane/text2image)
![Docker Pulls](https://img.shields.io/docker/pulls/disane/text2image)
![Docker Image Version (latest semver)](https://img.shields.io/docker/v/disane/text2image)

![image](./public/text2image.png)

# text2image

This docker container enables you to create images from links. This is pretty useful for using in blogs or automations (like [n8n](https://blog.disane.dev/n8n-unleashed/)).

# ✨ Features

- Customizable presets (for sizes or templates)
- Highly customziable via HTML/CSS
- Complete support füpr custom fonts
- Built-in [TailwindCSS](https://tailwindcss.com/docs/installation) support
- Runs within a Docker container
- Secured by configurable `API_KEY`
- Generate images from URLs with [OpenGraph](https://ogp.me/) fetching

> [!NOTE]
> Using the `API_KEY` is mandatory to prevent unauthorized access

# 🏗️ Installation

To use this piece of software you need a Docker host. Just run the following command and you're good to go:

```bash
docker run
  -d --name='text2image'
  -e 'API_KEY'='[YOUR API-KEY]'
  -p '3000:3000/tcp'
  -v '/mnt/user/appdata/text2image/config':'/text2image/config':'rw'
  -v '/mnt/user/appdata/text2image/logs':'/text2image/logs':'rw' 'disane/text2image'
  'disane/text2image'

```

> [!IMPORTANT]
> Please don't forget to mount the `config` and`log` folder. You can do that with docker volumnes against `/text2image/config` or `/text2image/log/`

> [!NOTE]
> If you mount the folders the default content is only copied once! Therefore you won't get new templates. If you want to get the latest stuff, you have do remove all mounted folders and restart the container. _Make a backup of your files_. The System will copy the default stuff if they are missing. After that you can copy/replace your changes. Currently there is no migration or merging your content with new one.

# 🛠️ Usage

You can create new images by browsing the following url (only `GET` is supported):

```bash
curl -XGET 'https://[YOUR URL]:3000/image/[:preset]/[image]/?url=https://images.unsplash.com/photo-1682686581660-3693f0c588d2&apiKey=[YOUR APIKEY]'
```

# 🤞 `GET`-Parameters

| Param         | Mandatory | Default | Description                                                    |
| ---------     | --------- | ------- | -------------------------------------------------------------- |
| preset        | ✅        | null    | Preset to use. Defined in \`./config/presets.json\`            |
| openGraphUrl  | ❌         | false   | Activates fetching opengraph data from given url               |
| image         | ✅         | null    | Filename with extension                                        |
| apiKey        | ✅         | null    | Your defined API-Key                                           |

> [!NOTE]
> All other parameters in query string will be passed into the `data` to use in the template. See [customizing](#💫-customizing) for more.

# 🤙 `POST`-Parameters

Method `POST` supports/needs all `GET` parameters but you can enrich the data for the template by giving the `POST` an `application/json` payload with this structure:
``` json
{
    "data": {
        "test": "yes"
    }
}
```

> [!IMPORTANT]
> You need an object `data` in your payload!


# 👨‍💻 Presets

You can add `presets` for different purposes like social media images or something else. All presets are defined in `./config/presets.json`:

```json
{
  "blog": {
    "sizes": {
      "width": 1920,
      "height": 1080
    },
    "template": "blog.hbs"
  },
  "instagram": {
    "sizes": {
      "width": 1080,
      "height": 1080
    },
    "template": "instagram.hbs"
  }
}
```

> [!NOTE]
> Every preset has only one template. This templates uses simple HTML/CSS with native TailwindCSS support.


# 💫 Customizing

With [handlebars](https://handlebarsjs.com/) it's possible to use pre-defined data within preset templates.

These variables/placeholders are available in the template:
```ts
export interface TemplateData {
  url?: string; // filled when query param `url`` is used

  queryParams?: { [key: string]: unknown }; // contains all query params

  data?: { [key: string]: unknown }; // contains all data in payload.data

  openGraph?: { [key: string]: string }; // contains all opengraph data (when `openGraphUrl` is used)
}

```

available.

# 🆙 Custom font

We're exposing a `head.hbs` template to enable custom HTML stuff, like custom fonts:

```hbs
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.cdnfonts.com/css/luckiest-guy" rel="stylesheet" />
<style>
  .stroke { -webkit-text-stroke-width: 5px; -webkit-text-stroke-color: #000; }

</style>
<script>
  tailwind.config = { theme: { extend: { fontFamily: { 'luckiest-guy': 'Luckiest
  Guy' } } } }
</script>
```

# 🚀 Examples

## OpenGraph

![image](./public/openGraph.png)

```bash
GET https://[YOUR URL]/image/instagram/test.jpg/?openGraphURl=https://blog.disane.dev/pseudo-selector-nth-child-ganz-einfach-erklart/
```

```hbs
<div class="bg-white h-full w-full flex flex-col rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
    <img class="rounded-t-lg" src="{{openGraph.image}}" alt="{{ openGraph.title }}" />
    <div class="p-5 h-full grow">
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{{ openGraph.title }}</h5>
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">{{openGraph.description}}</p>
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">{{openGraph.site_name}}</p>
    </div>
</div>


```

## "Normal" Mode

![image](./public/normalMode.png)

```bash
GET https://[YOUR URL]/image/blog/test.jpg?url=https://images.unsplash.com/photo-1682687982468-4584ff11f88a&text=Wonderful%20image
```

```hbs
<div class="absolute transparent w-full h-full flex flex-col place-items-center justify-center font-luckiest-guy">
     <div class="stroke p-4 text-center text-9xl place-items-center text-white transparent break-words drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)]">
    {{text}}
    </div>
</div>

<img class="object-fit w-full h-full" src="{{url}}" />
```

> [!NOTE]
> You can even mix params from query string with data form an webpage via `OpenGraph`

# Cheers 🔥