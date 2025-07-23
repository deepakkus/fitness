export async function addSlider({
    title,
    description,
    category,
    subcategory,
    image
  }: {
    title: string;
    description?: string;
    category?: string;
    subcategory?: string;
    image: File;
  }) {
    try {
      const formData = new FormData();
      formData.append('title', title);
      if (description) formData.append('description', description);
      if (category) formData.append('category', category);
      if (subcategory) formData.append('subcategory', subcategory);
      formData.append('image', image);
      
      const response = await fetch('/api/sliders', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!result.status) {
        throw new Error(result.message || 'Failed to add slider');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error adding slider:', error);
      throw error;
    }
  }