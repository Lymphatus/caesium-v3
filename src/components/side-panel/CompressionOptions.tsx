import { Accordion, AccordionItem, Checkbox, Tab, Tabs } from '@heroui/react';

function CompressionOptions() {
  return (
    <div className="size-full py-2">
      <Tabs fullWidth size="sm">
        <Tab title="Quality">
          <div className="text-left flex flex-col gap-2">
            <Accordion selectionMode="multiple" keepContentMounted defaultSelectedKeys="all" isCompact className="px-0">
              <AccordionItem key="1" aria-label="JPEG" title="JPEG">
                aaaa
              </AccordionItem>
              <AccordionItem key="2" aria-label="PNG" title="PNG">
                bbbb
              </AccordionItem>
              <AccordionItem key="3" aria-label="WebP" title="WebP">
                cccc
              </AccordionItem>
              <AccordionItem key="4" aria-label="TIFF" title="TIFF">
                dddd
              </AccordionItem>
            </Accordion>

            <Checkbox size="sm" disableAnimation>
              Lossless
            </Checkbox>
            <Checkbox size="sm" disableAnimation>
              Keep metadata
            </Checkbox>
          </div>
        </Tab>
        <Tab title="Size">
          <div>Size</div>
        </Tab>
      </Tabs>
    </div>
  );
}

export default CompressionOptions;
