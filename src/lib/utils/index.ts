export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(" ");
};

export const downloadImage = (url: string, filename: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("Download failed");
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        resolve();
      })
      .catch(reject);
  });
};

export const formatIconFilename = (
  item: string,
  style: string,
  format: string = "jpg"
): string => {
  const cleanItem = item.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const cleanStyle = style.toLowerCase().replace(/[^a-z0-9]/g, "-");
  return `${cleanItem}-${cleanStyle}-icon.${format}`;
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Style utilities
export const paletteHint = (hexes?: string[]) =>
  hexes && hexes.length
    ? `use a cohesive palette including ${hexes.join(", ")}`
    : "";
